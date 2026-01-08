import { AttendanceStatus, AttendanceFilterStatus } from "../constants/attendance.constants";
import { Department } from "../constants";
import { AttendanceQuery } from "../interfaces/model.interface";

/**
 * Attendance Filter Utility
 * Handles filter building and pagination for attendance queries following PaginationService pattern
 */
export class AttendanceFilterUtil {
    /**
     * Build filters from query params 
     */
    static buildFilters(
        query: AttendanceQuery,
        filterFields: string[]
    ): { attendanceFilter: Record<string, any>; employeeFilter: Record<string, any>; specialFilter: string | null } {
        const attendanceFilter: Record<string, any> = {};
        const employeeFilter: Record<string, any> = {};
        let specialFilter: string | null = null;

        filterFields.forEach(field => {
            const value = (query as any)[field];
            if (value !== undefined && value !== null && value !== Department.ALL && value.toString().trim() !== '') {
                if (field === 'status') {
                    switch (value) {
                        case AttendanceFilterStatus.CHECKED_IN:
                            specialFilter = 'checkedIn';
                            break;
                        case AttendanceFilterStatus.CHECKED_OUT:
                            specialFilter = 'checkedOut';
                            break;
                        case AttendanceFilterStatus.NOT_MARKED:
                            specialFilter = 'notMarked';
                            break;
                        case AttendanceFilterStatus.ON_LEAVE:
                            specialFilter = 'onLeave';
                            break;
                        case AttendanceFilterStatus.LATE:
                            specialFilter = 'late';
                            break;
                        default:
                            // If it's already an internal status value
                            if (Object.values(AttendanceStatus).includes(value)) {
                                attendanceFilter.status = value;
                            }
                    }
                } else if (field === 'department') {
                    employeeFilter.department = value;
                }
            }
        });

        return { attendanceFilter, employeeFilter, specialFilter };
    }

    /**
     * Apply special filter logic for Checked In/Checked Out/Not Marked/On Leave
     */
    static applySpecialFilter(records: any[], specialFilter: string | null): any[] {
        if (!specialFilter) {
            return records;
        }

        if (specialFilter === 'checkedIn') {
            // Filter records with checkIn but no checkOut
            return records.filter(r => r.checkIn !== '' && r.checkOut === '');
        } else if (specialFilter === 'checkedOut') {
            // Filter records with both checkIn and checkOut
            return records.filter(r => r.checkIn !== '' && r.checkOut !== '');
        } else if (specialFilter === 'notMarked') {
            // Filter records with no attendance (no checkIn at all)
            return records.filter(r => r.checkIn === '' && r.checkOut === '' && r.status === 'Absent');
        } else if (specialFilter === 'onLeave') {
            // Filter records for employees who are on approved leave
            return records.filter(r => r.status === 'On Leave');
        } else if (specialFilter === 'late') {
            // Filter records for employees who are late
            return records.filter(r => r.status === 'Late');
        }

        return records;
    }

    /**
     * Apply pagination to records
     */
    static applyPagination(
        records: any[],
        page: number,
        limit: number
    ): { paginatedRecords: any[]; pagination: any } {
        const totalCount = records.length;
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;

        const paginatedRecords = records.slice(skip, skip + limit);

        return {
            paginatedRecords,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    }

    /**
     * Build filters response object
     */
    static buildFiltersResponse(query: AttendanceQuery, dateParam?: string): any {
        return {
            date: dateParam || new Date().toISOString().split('T')[0],
            status: query.status || null,
            department: query.department || null
        };
    }
}
