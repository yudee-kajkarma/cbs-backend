import cron from 'node-cron';
import Employee from "../models/employee.model";
import { EmployeeStatus } from "../constants/common.constants";
import { MonthlyPayrollService } from "./monthly-payroll.service";
import { ErrorHandler } from "../utils/error-handler.util";

export class PayrollCronService {
  
  /**
   * Runs every day at 00:05 (12:05 AM)
   * Updates or creates payroll for the current month based on daily attendance
   */
  static startMonthlyPayrollGenerator(): void {
    cron.schedule('5 0 * * *', async () => {
      await this.runMonthlyPayrollGenerator();
    });
    console.log('Daily payroll update cron job scheduled at 00:05 (12:05 AM)');
  }

  /**
   * Execute daily payroll update for all active employees
   * Updates or creates payroll for the current month
   */
  private static async runMonthlyPayrollGenerator(): Promise<void> {
    try {
      const now = new Date();
      // Get current month
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      console.log(`Starting daily payroll update for ${month}/${year}...`);

      // Get all active employees
      const activeEmployees = await Employee.find({
        status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE] }
      });

      let createdCount = 0;
      let updatedCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const employee of activeEmployees) {
        try {
          // Skip if employee has no salary set
          if (!employee.salary || employee.salary === 0) {
            skipCount++;
            continue;
          }

          const result = await MonthlyPayrollService.updateOrCreatePayroll(
            employee._id.toString(),
            month,
            year
          );
          
          if (result.action === 'created') {
            createdCount++;
          } else if (result.action === 'updated') {
            updatedCount++;
          } else if (result.action === 'skipped') {
            skipCount++;
          }
        } catch (error: any) {
          errorCount++;
          console.error(`Error processing payroll for employee ${employee._id}:`, error?.message);
        }
      }

      console.log(`Daily payroll update completed for ${month}/${year}:`);
      console.log(`  - Created: ${createdCount}`);
      console.log(`  - Updated: ${updatedCount}`);
      console.log(`  - Skipped: ${skipCount}`);
      console.log(`  - Errors: ${errorCount}`);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'PayrollCronService', 
        method: 'runMonthlyPayrollGenerator' 
      });
    }
  }
}
