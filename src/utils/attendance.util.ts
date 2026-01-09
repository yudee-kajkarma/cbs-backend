import { AttendanceStatus, SalaryStatus } from "../constants/attendance.constants";
import { MetadataService } from "../services/metadata.service";

/**
 * Attendance Utility Functions
 * Helper functions for attendance calculations
 */
export class AttendanceUtil {
  /**
   * Calculate working hours between check-in and check-out
   */
  static calculateWorkingHours(checkInTime: Date, checkOutTime: Date): number {
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
  }
  
  /**
   * Calculate overtime hours based on policy
   */
  static calculateOvertimeHours(workingHours: number, standardHours: number): number {
    if (workingHours > standardHours) {
      return Math.round((workingHours - standardHours) * 100) / 100;
    }
    return 0;
  }
  
  /**
   * Check if arrival is late based on policy
   */
  static isLateArrival(checkInTime: Date, gracePeriodMinutes: number, standardWorkStartTime: string): { isLate: boolean, minutesLate: number } {
    const expectedStart = new Date(checkInTime);
    const [hours, minutes] = standardWorkStartTime.split(':');
    expectedStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const graceEndTime = new Date(expectedStart.getTime() + gracePeriodMinutes * 60000);
    
    if (checkInTime > graceEndTime) {
      const minutesLate = Math.floor((checkInTime.getTime() - graceEndTime.getTime()) / 60000);
      return { isLate: true, minutesLate };
    }
    
    return { isLate: false, minutesLate: 0 };
  }
  
  /**
   * Determine attendance status
   */
  static determineAttendanceStatus(workingHours: number, isLate: boolean): string {
    if (workingHours === 0) {
      return AttendanceStatus.ABSENT;
    }
    
    if (isLate) {
      return AttendanceStatus.LATE;
    }
    
    return AttendanceStatus.PRESENT;
  }
  
  /**
   * Get working days in month
   */
  static getWorkingDaysInMonth(month: number, year: number, policy: any): number {
    const totalDays = new Date(year, month, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      if (policy.workingDaysPerWeek === 5 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      } else if (policy.workingDaysPerWeek === 6 && dayOfWeek >= 1 && dayOfWeek <= 6) {
        workingDays++;
      }
    }
    
    return workingDays;
  }
  
  /**
   * Get working days in a date range (for mid-month calculations)
   */
  static getWorkingDaysInRange(startDate: Date, endDate: Date, policy: any): number {
    let workingDays = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      
      if (policy.workingDaysPerWeek === 5 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      } else if (policy.workingDaysPerWeek === 6 && dayOfWeek >= 1 && dayOfWeek <= 6) {
        workingDays++;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  }
  
  /**
   * Format time to HH:mm:ss
   */
  static formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  /**
   * Calculate daily salary based on working hours and policy
   */
  static calculateDailySalary(
    attendance: any,
    isOnLeave: boolean,
    monthlySalary: number,
    workingDaysPerMonth: number,
    standardHours: number,
    concessionPercentage: number,
    deductionPercentage: number
  ): {
    status: string;
    deduction: number;
    amount: number;
  } {
    const dailySalary = monthlySalary / workingDaysPerMonth;
    
    // Calculate minimum hours needed (with concession)
    const minHoursForFullSalary = standardHours * (1 - concessionPercentage / 100);
    
    // Case 1: Absent or On Leave = Zero salary
    if (!attendance || isOnLeave) {
      return {
        status: SalaryStatus.ZERO,
        deduction: Math.round(dailySalary * 100) / 100,
        amount: 0
      };
    }
    
    // Case 2: Present but hours not sufficient = Deducted salary
    if (attendance.workingHours < minHoursForFullSalary) {
      const deductedAmount = dailySalary * (deductionPercentage / 100);
      const finalAmount = dailySalary - deductedAmount;
      
      return {
        status: SalaryStatus.DEDUCTED,
        deduction: Math.round(deductedAmount * 100) / 100,
        amount: Math.round(finalAmount * 100) / 100
      };
    }
    
    // Case 3: Met minimum hours = Full salary
    return {
      status: SalaryStatus.FULL,
      deduction: 0,
      amount: Math.round(dailySalary * 100) / 100
    };
  }

  /**
   * Build employee attendance record for daily summary
   */
  static buildEmployeeAttendanceRecord(
    employee: any,
    attendance: any,
    isOnLeave: boolean,
    workingDaysPerMonth: number,
    policy: any
  ): any {
    const salaryInfo = this.calculateDailySalary(
      attendance,
      isOnLeave,
      employee.salary || 0,
      workingDaysPerMonth,
      policy.standardHoursPerDay,
      policy.hoursConcessionPercentage,
      policy.shortfallDeductionPercentage
    );

    const userName = typeof employee.userId === 'object' && employee.userId !== null 
      ? (employee.userId as any).fullName 
      : '';

    // Determine display status:
    // - If on leave: "On Leave"
    // - If attendance exists: use actual status (Present/Late/etc)
    // - If no attendance record: "Absent" (will be displayed as "Not Marked" in UI for current day)
    let displayStatus: string;
    if (isOnLeave) {
      displayStatus = AttendanceStatus.ON_LEAVE;
    } else if (attendance) {
      displayStatus = attendance.status;
    } else {
      displayStatus = AttendanceStatus.ABSENT;
    }

    return {
      empId: employee.employeeId || '',
      name: userName,
      department: employee.department,
      position: employee.position,
      checkIn: attendance?.checkInTime ? this.formatTime(attendance.checkInTime) : '',
      checkOut: attendance?.checkOutTime ? this.formatTime(attendance.checkOutTime) : '',
      hoursWorked: attendance?.workingHours || 0,
      status: displayStatus,
      salaryStatus: salaryInfo.status,
      deductionAmount: salaryInfo.deduction,
      salaryForDay: salaryInfo.amount
    };
  }

  /**
   * Calculate attendance summary statistics
   */
  static calculateSummaryStatistics(records: any[], totalEmployees: number): {
    present: number;
    absent: number;
    onLeave: number;
    attendancePercent: number;
  } {
    const present = records.filter(r => 
      r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
    ).length;
    const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const onLeave = records.filter(r => r.status === AttendanceStatus.ON_LEAVE).length;
    const attendancePercent = totalEmployees > 0 
      ? Math.round((present / totalEmployees) * 100) 
      : 0;

    return { present, absent, onLeave, attendancePercent };
  }

  /**
   * Build salary rules description
   */
  static buildSalaryRules(policy: any): any {
    const minHoursForFullSalary = policy.standardHoursPerDay * 
      (1 - policy.hoursConcessionPercentage / 100);

    return {
      fullSalary: {
        condition: `Hours ≥ ${minHoursForFullSalary.toFixed(1)} hrs = 100% salary`,
        threshold: minHoursForFullSalary,
        percentage: 100
      },
      deducted: {
        condition: `Hours < ${minHoursForFullSalary.toFixed(1)} hrs = ${100 - policy.shortfallDeductionPercentage}% salary`,
        threshold: minHoursForFullSalary,
        percentage: 100 - policy.shortfallDeductionPercentage
      },
      zeroSalary: {
        condition: 'Absent/Leave = 0% salary'
      }
    };
  }
}
