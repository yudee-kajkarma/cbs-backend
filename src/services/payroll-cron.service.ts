import cron from 'node-cron';
import Employee from "../models/employee.model";
import { EmployeeStatus } from "../constants/common.constants";
import { MonthlyPayrollService } from "./monthly-payroll.service";
import { ErrorHandler } from "../utils/error-handler.util";

export class PayrollCronService {
  
  /**
   * Runs on the 1st day of every month at 00:05 (5 minutes past midnight)
   * Generates payroll for the previous month
   */
  static startMonthlyPayrollGenerator(): void {
    cron.schedule('5 0 1 * *', async () => {
      await this.runMonthlyPayrollGenerator();
    });
  }

  /**
   * Execute monthly payroll generation for all active employees
   * Generates payroll for the previous month
   */
  private static async runMonthlyPayrollGenerator(): Promise<void> {
    try {
      const now = new Date();
      // Get previous month
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const month = previousMonth.getMonth() + 1;
      const year = previousMonth.getFullYear();

      // Get all active employees
      const activeEmployees = await Employee.find({
        status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE] }
      });

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const employee of activeEmployees) {
        try {
          // Skip if employee has no salary set
          if (!employee.salary || employee.salary === 0) {
            skipCount++;
            continue;
          }

          await MonthlyPayrollService.generatePayroll(
            employee._id.toString(),
            month,
            year
          );
          
          successCount++;
        } catch (error: any) {
          // Skip if payroll already exists
          if (error?.code === 'CBS-4013-1') {
            skipCount++;
          } else {
            errorCount++;
          }
        }
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'PayrollCronService', 
        method: 'runMonthlyPayrollGenerator' 
      });
    }
  }
}
