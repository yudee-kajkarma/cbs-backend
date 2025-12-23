import Attendance from "../models/attendance.model";
import Employee from "../models/employee.model";
import LeaveApplication from "../models/leaveApplication.model";
import { AttendancePolicyService } from "./attendance-policy.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { AttendanceUtil } from "../utils/attendance.util";
import { AttendanceFilterUtil } from "../utils/attendance-filter.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { AttendanceStatus } from "../constants/attendance.constants";
import { LeaveApplicationStatus, EmployeeStatus } from "../constants";
import {
    AttendanceDocument,
    AttendanceQuery,
    MonthlyStatistics,
    DailyAttendanceSummaryResponse,
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
     * Check-in for the day
     */
    static async checkIn(employeeId: string, ipAddress: string): Promise<AttendanceDocument> {
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

            const employee = await Employee.findById(employeeId);
            if (!employee) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
            }

            // Get attendance policy
            const policy = await AttendancePolicyService.get();

            const checkInTime = new Date();
            const { isLate, minutesLate } = AttendanceUtil.isLateArrival(
                checkInTime,
                policy.lateArrivalGracePeriod
            );

            const attendance = await Attendance.create({
                employeeId,
                date: today,
                checkInTime,
                checkInIP: ipAddress,
                isLateArrival: isLate,
                lateArrivalMinutes: minutesLate,
                workingHours: 0,
                overtimeHours: 0,
                status: AttendanceStatus.PRESENT
            });

            return await this.formatAttendanceRecord(attendance._id);
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'AttendanceService', method: 'checkIn', employeeId });
        }
    }

    /**
     * Check-out for the day
     */
    static async checkOut(employeeId: string, ipAddress: string): Promise<AttendanceDocument> {
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

            await Attendance.findByIdAndUpdate(
                attendance._id,
                {
                    $set: {
                        checkOutTime,
                        checkOutIP: ipAddress,
                        workingHours,
                        overtimeHours,
                        status
                    }
                },
                { new: true }
            );

            return await this.formatAttendanceRecord(attendance._id);
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

            // Build filters using AttendanceFilterUtil
            const { attendanceFilter, employeeFilter, specialFilter } = AttendanceFilterUtil.buildFilters(query, filterFields);

            // Add base filters
            attendanceFilter.date = startOfDay;
            employeeFilter.status = EmployeeStatus.ACTIVE;

            const policy = await AttendancePolicyService.get();

            const allEmployees = await Employee.find(employeeFilter)
                .populate('userId', 'fullName email')
                .lean();

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

            const employeesOnLeave = leaveApplications.map(l => l.employeeId._id.toString());

            // Calculate working days per month
            const workingDaysPerMonth = AttendanceUtil.getWorkingDaysInMonth(
                date.getMonth() + 1,
                date.getFullYear(),
                policy
            );

            // Build detailed records for each employee
            let detailedRecords = allEmployees.map(employee => {
                const empId = employee._id.toString();
                const attendance = attendanceRecords.find(r =>
                    r.employeeId?._id?.toString() === empId
                );
                const isOnLeave = employeesOnLeave.includes(empId);

                return AttendanceUtil.buildEmployeeAttendanceRecord(
                    employee,
                    attendance,
                    isOnLeave,
                    workingDaysPerMonth,
                    policy
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

            records.forEach(record => {
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
            leaveApplications.forEach(leave => {
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
}
