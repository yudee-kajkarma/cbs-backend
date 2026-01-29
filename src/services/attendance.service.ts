import { Attendance, LeaveApplication } from "../models";
import { Request, Response } from "express";
import { AttendancePolicyService } from "./attendance-policy.service";
import { MetadataService } from "./metadata.service";
import { EmployeeService } from "./employee.service";
import { SSEService } from "./sse.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { AttendanceUtil } from "../utils/attendance.util";
import { AttendanceFilterUtil } from "../utils/attendance-filter.util";
import { ActivityLogger } from "../utils/activity-logger.util";
import { TimezoneUtil } from "../utils/timezone.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { AttendanceStatus } from "../constants/attendance.constants";
import { LeaveApplicationStatus, EmployeeStatus } from "../constants";
import { ActivityType, ActivityModule } from "../constants/activity-log.constants";
import {
    AttendanceDocument,
    AttendanceQuery,
    MonthlyStatistics,
    DailyAttendanceSummaryResponse,
    PopulatedEmployee,
} from "../interfaces/model.interface";

export class AttendanceService {

    /**
     * Helper: Format attendance record with populated employee data
     */
    private static async formatAttendanceRecord(attendanceId: string): Promise<AttendanceDocument> {
        const populated = await Attendance.findById(attendanceId)
            .populate({
                path: 'employeeId',
                select: 'employeeId position department',
                populate: {
                    path: 'userId',
                    select: 'fullName email'
                }
            })
            .lean();

        return populated as AttendanceDocument;
    }

    /**
     * Get today's attendance status for an employee
     * Always returns an object with hasCheckedIn, hasCheckedOut, date, and message (never null)
     */
    static async getTodayStatus(employeeId: string): Promise<{
        hasCheckedIn: boolean;
        hasCheckedOut: boolean;
        date: string;
        message: string;
        checkInTime?: string;
        status?: string;
        employee?: {
            _id: string;
            employeeId: string;
            userId: { _id: string; fullName: string; email: string };
            department: string;
            position: string;
        };
    }> {
        try {
            const now = new Date();
            // Use UTC date range so we match records stored as UTC midnight (e.g. 2026-01-29T00:00:00.000Z)
            const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
            const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

            const attendance = await Attendance.findOne({
                employeeId,
                date: { $gte: startOfDayUTC, $lte: endOfDayUTC }
            }).lean();

            if (!attendance) {
                return {
                    hasCheckedIn: false,
                    hasCheckedOut: false,
                    date: startOfDayUTC.toISOString(),
                    message: 'No attendance record for today'
                };
            }

            // Fetch full record with populated employee for response
            const populated = await this.formatAttendanceRecord(attendance._id);
            const hasCheckedOut = !!(populated as any).checkOutTime;
            const dateStr = (populated as any).date instanceof Date
                ? (populated as any).date.toISOString()
                : new Date((populated as any).date).toISOString();
            const checkInTime = (populated as any).checkInTime instanceof Date
                ? (populated as any).checkInTime.toISOString()
                : (populated as any).checkInTime
                    ? new Date((populated as any).checkInTime).toISOString()
                    : undefined;

            const emp = (populated as any).employeeId;
            const employee = emp
                ? {
                    _id: emp._id?.toString?.() ?? String(emp._id),
                    employeeId: emp.employeeId ?? '',
                    userId: emp.userId
                        ? {
                            _id: emp.userId._id?.toString?.() ?? String(emp.userId._id),
                            fullName: emp.userId.fullName ?? '',
                            email: emp.userId.email ?? ''
                        }
                        : { _id: '', fullName: '', email: '' },
                    department: emp.department ?? '',
                    position: emp.position ?? ''
                }
                : undefined;

            return {
                hasCheckedIn: true,
                hasCheckedOut,
                date: dateStr,
                message: hasCheckedOut ? 'Checked out' : 'Checked in',
                checkInTime,
                status: (populated as any).status ?? 'Present',
                employee
            };
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'AttendanceService',
                method: 'getTodayStatus',
                employeeId
            });
        }
    }

    /**
     * Check-in for the day
     */
    static async checkIn(
        employeeId: string, 
        ipAddress: string, 
        location?: { latitude?: number; longitude?: number }
    ): Promise<AttendanceDocument> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingRecord = await Attendance.findOne({
                employeeId,
                date: today
            });

            if (existingRecord) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ATTENDANCE_ALREADY_CHECKED_IN);
            }

            const employee = await EmployeeService.getById(employeeId);
            if (!employee) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
            }

            // Get attendance policy and metadata
            const policy = await AttendancePolicyService.get();
            const metadata = await MetadataService.get();

            const checkInTime = new Date();
            const { isLate, minutesLate } = AttendanceUtil.isLateArrival(
                checkInTime,
                policy.lateArrivalGracePeriod,
                metadata.standardWorkStartTime
            );

            // Detect timezone from location if provided
            const checkInTimeZone = location?.latitude && location?.longitude
                ? TimezoneUtil.detectTimezone(location.latitude, location.longitude)
                : null;

            // Validate timezone based on metadata settings
            if (!metadata.allowTimeZone) {
                // Location is required when timezone restriction is enabled
                if (!location?.latitude || !location?.longitude) {
                    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LOCATION_REQUIRED);
                }
                
                // Check if detected timezone matches configured timezone
                if (checkInTimeZone !== metadata.timeZone) {
                    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TIMEZONE_MISMATCH);
                }
            }

            const attendance = await Attendance.create({
                employeeId,
                date: today,
                checkInTime,
                checkInIP: ipAddress,
                checkInLocation: location,
                checkInTimeZone,
                isLateArrival: isLate,
                lateArrivalMinutes: minutesLate,
                workingHours: 0,
                overtimeHours: 0,
                status: AttendanceStatus.PRESENT
            });

            const formattedRecord = await this.formatAttendanceRecord(attendance._id);

            // Log activity
            const userId = employee.userId?._id 
                ? employee.userId._id.toString() 
                : (employee.userId ? employee.userId.toString() : employeeId);
            
            await ActivityLogger.log({
                userId,
                employeeId: employeeId,
                type: ActivityType.CHECK_IN,
                action: 'Checked in',
                module: ActivityModule.ATTENDANCE,
                entity: { type: 'attendance', id: attendance._id },
                description: `Checked in at ${checkInTime.toLocaleTimeString('en-US', { hour12: false })}`,
                metadata: {
                    checkInTime: checkInTime.toISOString(),
                    isLateArrival: isLate,
                    lateArrivalMinutes: minutesLate,
                    ipAddress
                }
            });

            // Broadcast check-in event via SSE
            try {
                const employeeData = formattedRecord.employeeId as any;
                SSEService.broadcastCheckIn({
                    empId: employeeData.employeeId,
                    name: employeeData.userId?.fullName || 'Unknown',
                    department: employeeData.department || 'N/A',
                    checkInTime: checkInTime.toISOString(),
                    timestamp: new Date().toISOString()
                });

                await this.broadcastSummaryUpdate(employeeId);
            } catch (sseError) {
                ErrorHandler.handleServiceError(sseError, { 
                    serviceName: 'AttendanceService', 
                    method: 'checkIn - SSE broadcast', 
                    employeeId,
                    context: 'Non-critical SSE broadcast failure'
                });
            }

            return formattedRecord;
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'AttendanceService', method: 'checkIn', employeeId });
        }
    }

    /**
     * Check-out for the day
     */
    static async checkOut(
        employeeId: string, 
        ipAddress: string,
        location?: { latitude?: number; longitude?: number }
    ): Promise<AttendanceDocument> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const attendance = await Attendance.findOne({
                employeeId,
                date: today
            });

            if (!attendance) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ATTENDANCE_NOT_CHECKED_IN);
            }

            if (attendance.checkOutTime) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ATTENDANCE_ALREADY_CHECKED_OUT);
            }

            const policy = await AttendancePolicyService.get();

            // Calculate working hours
            const checkOutTime = new Date();
            const workingHours = AttendanceUtil.calculateWorkingHours(
                attendance.checkInTime,
                checkOutTime
            );

            // Calculate overtime
            const overtimeHours = AttendanceUtil.calculateOvertimeHours(
                workingHours,
                policy.standardHoursPerDay
            );

            // Determine final status
            const status = AttendanceUtil.determineAttendanceStatus(
                workingHours,
                attendance.isLateArrival
            );

            // Detect timezone from location if provided
            const checkOutTimeZone = location?.latitude && location?.longitude
                ? TimezoneUtil.detectTimezone(location.latitude, location.longitude)
                : null;

            // Get metadata for timezone validation
            const metadata = await MetadataService.get();
            
            // Validate timezone based on metadata settings
            if (!metadata.allowTimeZone) {
                // Location is required when timezone restriction is enabled
                if (!location?.latitude || !location?.longitude) {
                    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LOCATION_REQUIRED);
                }
                
                // Check if detected timezone matches configured timezone
                if (checkOutTimeZone !== metadata.timeZone) {
                    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TIMEZONE_MISMATCH);
                }
            }

            // Validate that checkout timezone matches checkin timezone
            if (attendance.checkInTimeZone && checkOutTimeZone) {
                if (attendance.checkInTimeZone !== checkOutTimeZone) {
                    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.CHECKOUT_TIMEZONE_MISMATCH);
                }
            }

            await Attendance.findByIdAndUpdate(
                attendance._id,
                {
                    $set: {
                        checkOutTime,
                        checkOutIP: ipAddress,
                        checkOutLocation: location,
                        checkOutTimeZone,
                        workingHours,
                        overtimeHours,
                        status
                    }
                },
                { new: true }
            );

            const formattedRecord = await this.formatAttendanceRecord(attendance._id);

            // Log activity
            const employee = await EmployeeService.getById(employeeId);
            if (employee) {
                await ActivityLogger.log({
                    userId: employee.userId._id ? employee.userId._id.toString() : employee.userId.toString(),
                    employeeId: employeeId,
                    type: ActivityType.CHECK_OUT,
                    action: 'Checked out',
                    module: ActivityModule.ATTENDANCE,
                    entity: { type: 'attendance', id: attendance._id },
                    description: `Checked out at ${checkOutTime.toLocaleTimeString('en-US', { hour12: false })}`,
                    metadata: {
                        checkOutTime: checkOutTime.toISOString(),
                        workingHours: parseFloat(workingHours.toFixed(2)),
                        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
                        status,
                        ipAddress
                    }
                });
            }

            // Broadcast check-out event via SSE
            try {
                const employeeData = formattedRecord.employeeId as any;
                SSEService.broadcastCheckOut({
                    empId: employeeData.employeeId,
                    name: employeeData.userId?.fullName || 'Unknown',
                    department: employeeData.department || 'N/A',
                    checkOutTime: checkOutTime.toISOString(),
                    hoursWorked: parseFloat(workingHours.toFixed(2)),
                    timestamp: new Date().toISOString()
                });

                await this.broadcastSummaryUpdate(employeeId);
            } catch (sseError) {
                ErrorHandler.handleServiceError(sseError, { 
                    serviceName: 'AttendanceService', 
                    method: 'checkOut - SSE broadcast', 
                    employeeId,
                    context: 'Non-critical SSE broadcast failure'
                });
            }

            return formattedRecord;
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'AttendanceService', method: 'checkOut', employeeId });
        }
    }

    /**
     * Get daily attendance summary with salary calculations
     */
    static async getDailySummary(query: AttendanceQuery): Promise<DailyAttendanceSummaryResponse> {
        try {
            const dateParam = query.date as string;
            const date = dateParam ? new Date(dateParam) : new Date();

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Define filter fields 
            const filterFields = ['status', 'department'];

            const { attendanceFilter, employeeFilter, specialFilter } = AttendanceFilterUtil.buildFilters(query, filterFields);

            // Add base filters
            attendanceFilter.date = startOfDay;
            employeeFilter.status = EmployeeStatus.ACTIVE;

            const policy = await AttendancePolicyService.get();
            const metadata = await MetadataService.get();

            const result = await EmployeeService.getAll({
                ...employeeFilter,
                limit: Number.MAX_SAFE_INTEGER,
                page: 1
            });
            const allEmployees = result.employees;

            // Get today's attendance records
            const attendanceRecords = await Attendance.find(attendanceFilter)
                .populate({
                    path: 'employeeId',
                    match: employeeFilter,
                    populate: { path: 'userId', select: 'fullName' }
                })
                .lean();

            // Get today's approved leaves
            const leaveApplications = await LeaveApplication.find({
                status: LeaveApplicationStatus.APPROVED,
                startDate: { $lte: startOfDay },
                endDate: { $gte: startOfDay }
            })
                .populate('employeeId')
                .lean();

            const employeesOnLeave = leaveApplications.map((l: any) => l.employeeId._id.toString());

            // Calculate working days per month
            const workingDaysPerMonth = AttendanceUtil.getWorkingDaysInMonth(
                date.getMonth() + 1,
                date.getFullYear(),
                policy
            );

            // Build detailed records for each employee
            let detailedRecords = allEmployees.map((employee: PopulatedEmployee) => {
                const empId = employee._id.toString();
                const attendance = attendanceRecords.find((r: any) =>
                    r.employeeId?._id?.toString() === empId
                );
                const isOnLeave = employeesOnLeave.includes(empId);

                // Determine timeZone based on allowTimeZone setting
                // If allowTimeZone is true: use checkInTimeZone from attendance record
                // If allowTimeZone is false: use metadata.timeZone (configured timeZone)
                const timeZone = metadata.allowTimeZone && attendance?.checkInTimeZone
                    ? attendance.checkInTimeZone
                    : metadata.timeZone;

                return AttendanceUtil.buildEmployeeAttendanceRecord(
                    employee,
                    attendance,
                    isOnLeave,
                    workingDaysPerMonth,
                    policy,
                    timeZone
                );
            });

            // Apply special filters (Checked In/Checked Out/Not Marked/On Leave)
            detailedRecords = AttendanceFilterUtil.applySpecialFilter(detailedRecords, specialFilter);

            // Calculate summary using filtered records (before pagination)
            const totalCountForSummary = specialFilter ? detailedRecords.length : allEmployees.length;
            const summary = AttendanceUtil.calculateSummaryStatistics(detailedRecords, totalCountForSummary);

            const salaryRules = AttendanceUtil.buildSalaryRules(policy);

            // Apply pagination using utility
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 10;
            const { paginatedRecords, pagination } = AttendanceFilterUtil.applyPagination(detailedRecords, page, limit);

            // Build filters response
            const filters = AttendanceFilterUtil.buildFiltersResponse(query, dateParam);

            return {
                summary,
                salaryRules,
                records: paginatedRecords,
                pagination,
                filters
            };
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'AttendanceService', method: 'getDailySummary', query });
        }
    }

    /**
     * Get employee attendance history for a date range
     */
    static async getAttendanceHistory(
        employeeId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<AttendanceDocument[]> {
        try {
            // Default to past 8 days if not provided
            const end = endDate ? new Date(endDate) : new Date();
            end.setHours(23, 59, 59, 999);

            const start = startDate ? new Date(startDate) : new Date();
            if (!startDate) {
                start.setDate(start.getDate() - 7); // 8 days including today
            }
            start.setHours(0, 0, 0, 0);

            const records = await Attendance.find({
                employeeId,
                date: { $gte: start, $lte: end }
            })
                .sort({ date: -1 })
                .lean();

            return records as AttendanceDocument[];
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'AttendanceService', method: 'getAttendanceHistory', employeeId, startDate, endDate });
        }
    }

    /**
     * Get monthly statistics for an employee
     */
    static async getMonthlyStatistics(
        employeeId: string,
        month: number,
        year: number
    ): Promise<MonthlyStatistics> {
        try {
            const startDate = new Date(year, month - 1, 1);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);

            const policy = await AttendancePolicyService.get();

            // Get all attendance records for the month
            const records = await Attendance.find({
                employeeId,
                date: { $gte: startDate, $lte: endDate }
            }).lean();

            // Get leave days for the month
            const leaveApplications = await LeaveApplication.find({
                employeeId,
                status: LeaveApplicationStatus.APPROVED,
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            }).lean();

            // Calculate working days in month
            const totalWorkingDays = AttendanceUtil.getWorkingDaysInMonth(
                month,
                year,
                policy
            );

            // Count different types of days
            let presentDays = 0;
            let absentDays = 0;
            let lateDays = 0;
            let totalWorkingHours = 0;
            let totalOvertimeHours = 0;

            records.forEach((record: any) => {
                if (record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE) {
                    presentDays++;
                    totalWorkingHours += record.workingHours || 0;
                    totalOvertimeHours += record.overtimeHours || 0;

                    if (record.isLateArrival) {
                        lateDays++;
                    }
                } else if (record.status === AttendanceStatus.ABSENT) {
                    absentDays++;
                }
            });

            // Calculate leave days
            let leaveDays = 0;
            leaveApplications.forEach((leave: any) => {
                leaveDays += leave.numberOfDays || 0;
            });

            // Calculate average working hours
            const averageWorkingHours = presentDays > 0
                ? Math.round((totalWorkingHours / presentDays) * 100) / 100
                : 0;

            return {
                totalWorkingDays,
                presentDays,
                absentDays,
                leaveDays,
                lateDays,
                averageWorkingHours,
                totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
                totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100
            };
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'AttendanceService', method: 'getMonthlyStatistics', employeeId, month, year });
        }
    }

    /**
     * Broadcast summary update via SSE
     * Helper method to calculate and broadcast current attendance summary
     */
    private static async broadcastSummaryUpdate(updatedEmployeeId?: string): Promise<void> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const summaryData = await this.getDailySummary({ 
                date: today,
                page: 1,
                limit: Number.MAX_SAFE_INTEGER 
            });

            const totalStaff = summaryData.pagination.totalCount;
            
            const checkedIn = summaryData.records.filter(r => r.checkIn !== '' && r.checkOut === '').length;
            const checkedOut = summaryData.records.filter(r => r.checkIn !== '' && r.checkOut !== '').length;
            const notMarked = summaryData.records.filter(r => r.checkIn === '' && r.status === 'Absent').length;
            const onLeave = summaryData.records.filter(r => r.status === 'On Leave').length;

            // Find the updated employee record if employeeId is provided
            let updatedRecord = undefined;
            if (updatedEmployeeId) {
                const employee = await EmployeeService.getById(updatedEmployeeId);
                if (employee) {
                    updatedRecord = summaryData.records.find(r => r.empId === employee.employeeId);
                }
            }

            SSEService.broadcastSummaryUpdate({
                summary: {
                    totalStaff,
                    checkedIn,
                    checkedOut,
                    notMarked,
                    onLeave,
                    present: summaryData.summary.present,
                    attendancePercent: summaryData.summary.attendancePercent
                },
                updatedRecord,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            ErrorHandler.handleServiceError(error, { 
                serviceName: 'AttendanceService', 
                method: 'broadcastSummaryUpdate', 
                context: 'Non-critical background operation'
            });
        }
    }

    /**
     * Stream live attendance updates via SSE
     */
    static async streamLiveAttendance(req: Request, res: Response, query: any): Promise<void> {
        try {
            const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Set SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');

            // Send initial connection event
            res.write(`event: connected\n`);
            res.write(`data: ${JSON.stringify({ 
                message: 'Connected to live attendance stream',
                clientId,
                timestamp: new Date().toISOString()
            })}\n\n`);

            // Register client with SSE service
            SSEService.addClient(clientId, res, query.department);

            // Send initial attendance summary
            try {
                const today = new Date().toISOString().split('T')[0];
                const summaryData = await this.getDailySummary({ 
                    date: today,
                    page: query.page || 1,
                    limit: query.limit || 100,
                    department: query.department
                });

                // Calculate counts for summary (same as broadcastSummaryUpdate)
                const totalStaff = summaryData.pagination.totalCount;
                const checkedIn = summaryData.records.filter(r => r.checkIn !== '' && r.checkOut === '').length;
                const checkedOut = summaryData.records.filter(r => r.checkIn !== '' && r.checkOut !== '').length;
                const notMarked = summaryData.records.filter(r => r.checkIn === '' && r.status === 'Absent').length;
                const onLeave = summaryData.records.filter(r => r.status === 'On Leave').length;

                res.write(`event: initial-summary\n`);
                res.write(`data: ${JSON.stringify({
                    summary: {
                        totalStaff,
                        checkedIn,
                        checkedOut,
                        notMarked,
                        onLeave,
                        present: summaryData.summary.present,
                        attendancePercent: summaryData.summary.attendancePercent
                    },
                    records: summaryData.records,
                    pagination: summaryData.pagination,
                    filters: summaryData.filters,
                    timestamp: new Date().toISOString()
                })}\n\n`);
            } catch (error) {
                ErrorHandler.handleServiceError(error, { 
                    serviceName: 'AttendanceService', 
                    method: 'streamLiveAttendance - initial summary', 
                    context: 'Failed to send initial SSE summary'
                });
            }

            // Handle client disconnect
            req.on('close', () => {
                SSEService.removeClient(clientId);
                res.end();
            });

            req.on('error', () => {
                SSEService.removeClient(clientId);
                res.end();
            });

        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'AttendanceService', method: 'streamLiveAttendance' });
        }
    }
}
