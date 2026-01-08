import TelexTransfer from "../models/telexTransfer.model";
import Cheque from "../models/cheque.model";
import User from "../models/user.model";
import Employee from "../models/employee.model";
import LeaveApplication from "../models/leaveApplication.model";
import MonthlyPayroll from "../models/monthlyPayroll.model";
import EmployeeBonus from "../models/employeeBonus.model";
import EmployeeIncentive from "../models/employeeIncentive.model";
import { UserRole, USER_ID_PREFIX } from "../constants/user.constants";
import { MONTHLY_PAYROLL_ID_PREFIX } from "../constants/monthly-payroll.constants";
import { BONUS_ID_PREFIX } from "../constants/bonus.constants";
import { INCENTIVE_ID_PREFIX } from "../constants/incentive.constants";
import { throwError } from "./errors.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";

/**
 * Utility class for generating reference numbers
 */
export class ReferenceGenerator {
    /**
     * Generate unique reference number for telex transfer
     * Format: TT-YYYY-MM-###
     */
    static async generateTelexTransferReference(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        const lastTransfer = await TelexTransfer
            .findOne({
                referenceNo: new RegExp(`^TT-${year}-${month}-`)
            })
            .sort({ referenceNo: -1 })
            .lean();
        
        let sequence = 1;
        if (lastTransfer && lastTransfer.referenceNo) {
            const lastSequence = parseInt(lastTransfer.referenceNo.split('-')[3]);
            sequence = lastSequence + 1;
        }
        
        return `TT-${year}-${month}-${String(sequence).padStart(3, '0')}`;
    }

    /**
     * Generate unique reference number for cheque
     * Format: CH-###
     */
    static async generateChequeReference(): Promise<string> {
        const lastCheque = await Cheque
            .findOne({}, { chequeNumber: 1 })
            .sort({ createdAt: -1 })
            .lean() as { chequeNumber?: string } | null;
        
        let nextNumber = 1;
        if (lastCheque?.chequeNumber) {
            const match = lastCheque.chequeNumber.match(/CH-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        
        return `CH-${nextNumber}`;
    }

    /**
     * Check if user ID already exists
     */
    private static async checkUserIdExists(userId: string): Promise<boolean> {
        const existingUser = await User.findOne({ userId }).lean();
        return !!existingUser;
    }

    /**
     * Check if employee ID already exists
     */
    private static async checkEmployeeIdExists(employeeId: string): Promise<boolean> {
        const existingEmployee = await Employee.findOne({ employeeId }).lean();
        return !!existingEmployee;
    }

    /**
     * Check if leave request ID already exists
     */
    private static async checkLeaveRequestIdExists(requestId: string): Promise<boolean> {
        const existingRequest = await LeaveApplication.findOne({ requestId }).lean();
        return !!existingRequest;
    }

    /**
     * Generate unique user ID based on role with retry mechanism
     * Format: ADMIN-###, HR-###, or USR-###
     */
    static async generateUserReference(role: string): Promise<string> {
        const maxRetries = 10;
        let attempts = 0;

        while (attempts < maxRetries) {
            let prefix: string = USER_ID_PREFIX.USER;
            if (role === UserRole.ADMIN) {
                prefix = USER_ID_PREFIX.ADMIN;
            } else if (role === UserRole.HR) {
                prefix = USER_ID_PREFIX.HR;
            }
            
            const lastUser = await User
                .findOne(
                    { userId: new RegExp(`^${prefix}-`) },
                    { userId: 1 }
                )
                .sort({ createdAt: -1 })
                .lean() as { userId?: string } | null;
            
            let userId: string;
            if (lastUser && lastUser.userId) {
                const lastNumber = parseInt(lastUser.userId.split('-')[1]);
                userId = `${prefix}-${String(lastNumber + 1).padStart(3, '0')}`;
            } else {
                userId = `${prefix}-001`;
            }

            // Check if this userId already exists
            const exists = await this.checkUserIdExists(userId);
            if (!exists) {
                return userId;
            }

            attempts++;
        }

        // If all retries failed, throw error
        throw throwError(ERROR_MESSAGES.SERVER_ERRORS.USER_ID_GENERATION_FAILED);
    }

    /**
     * Generate unique employee ID with retry mechanism
     * Format: EMP-###
     */
    static async generateEmployeeReference(): Promise<string> {
        const maxRetries = 10;
        let attempts = 0;

        while (attempts < maxRetries) {
            const lastEmployee = await Employee
                .findOne(
                    { employeeId: new RegExp('^EMP-') },
                    { employeeId: 1 }
                )
                .sort({ createdAt: -1 })
                .lean() as { employeeId?: string } | null;
            
            let employeeId: string;
            if (lastEmployee && lastEmployee.employeeId) {
                const lastNumber = parseInt(lastEmployee.employeeId.split('-')[1]);
                employeeId = `EMP-${String(lastNumber + 1).padStart(3, '0')}`;
            } else {
                employeeId = 'EMP-001';
            }

            // Check if this employeeId already exists
            const exists = await this.checkEmployeeIdExists(employeeId);
            if (!exists) {
                return employeeId;
            }

            attempts++;
        }

        // If all retries failed, throw error
        throw throwError(ERROR_MESSAGES.SERVER_ERRORS.EMPLOYEE_ID_GENERATION_FAILED);
    }

    /**
     * Generate unique leave application request ID with retry mechanism
     * Format: LV-YYYY-###
     */
    static async generateLeaveApplicationReference(): Promise<string> {
        const maxRetries = 10;
        let attempts = 0;

        while (attempts < maxRetries) {
            const year = new Date().getFullYear();
            const count = await LeaveApplication.countDocuments();
            const requestId = `LV-${year}-${String(count + 1).padStart(3, '0')}`;

            // Check if this requestId already exists
            const exists = await this.checkLeaveRequestIdExists(requestId);
            if (!exists) {
                return requestId;
            }

            attempts++;
        }

        // If all retries failed, throw error
        throw throwError(ERROR_MESSAGES.SERVER_ERRORS.LEAVE_REQUEST_ID_GENERATION_FAILED);
    }

    /**
     * Check if monthly payroll ID already exists
     */
    private static async checkMonthlyPayrollIdExists(payrollId: string): Promise<boolean> {
        const existing = await MonthlyPayroll.findOne({ payrollId }).lean();
        return !!existing;
    }

    /**
     * Generate unique monthly payroll ID with retry mechanism
     * Format: PAY-YYYY-MM-###
     */
    static async generateMonthlyPayrollReference(month: number, year: number): Promise<string> {
        const maxRetries = 10;
        let attempts = 0;

        while (attempts < maxRetries) {
            const monthStr = String(month).padStart(2, '0');
            const count = await MonthlyPayroll.countDocuments({ month, year });
            const payrollId = `${MONTHLY_PAYROLL_ID_PREFIX}-${year}-${monthStr}-${String(count + 1).padStart(3, '0')}`;

            const exists = await this.checkMonthlyPayrollIdExists(payrollId);
            if (!exists) {
                return payrollId;
            }

            attempts++;
        }

        throw throwError(ERROR_MESSAGES.SERVER_ERRORS.INTERNAL_SERVER_ERROR);
    }

    /**
     * Check if bonus ID already exists
     */
    private static async checkBonusIdExists(bonusId: string): Promise<boolean> {
        const existing = await EmployeeBonus.findOne({ bonusId }).lean();
        return !!existing;
    }

    /**
     * Generate unique bonus ID with retry mechanism
     * Format: BON-YYYY-MM-###
     */
    static async generateBonusReference(month: number, year: number): Promise<string> {
        const maxRetries = 10;
        let attempts = 0;

        while (attempts < maxRetries) {
            const monthStr = String(month).padStart(2, '0');
            const count = await EmployeeBonus.countDocuments({ month, year });
            const bonusId = `${BONUS_ID_PREFIX}-${year}-${monthStr}-${String(count + 1).padStart(3, '0')}`;

            const exists = await this.checkBonusIdExists(bonusId);
            if (!exists) {
                return bonusId;
            }

            attempts++;
        }

        throw throwError(ERROR_MESSAGES.SERVER_ERRORS.INTERNAL_SERVER_ERROR);
    }

    /**
     * Check if incentive ID already exists
     */
    private static async checkIncentiveIdExists(incentiveId: string): Promise<boolean> {
        const existing = await EmployeeIncentive.findOne({ incentiveId }).lean();
        return !!existing;
    }

    /**
     * Generate unique incentive ID with retry mechanism
     * Format: INC-YYYY-MM-###
     */
    static async generateIncentiveReference(month: number, year: number): Promise<string> {
        const maxRetries = 10;
        let attempts = 0;

        while (attempts < maxRetries) {
            const monthStr = String(month).padStart(2, '0');
            const count = await EmployeeIncentive.countDocuments({ month, year });
            const incentiveId = `${INCENTIVE_ID_PREFIX}-${year}-${monthStr}-${String(count + 1).padStart(3, '0')}`;

            const exists = await this.checkIncentiveIdExists(incentiveId);
            if (!exists) {
                return incentiveId;
            }

            attempts++;
        }

        throw throwError(ERROR_MESSAGES.SERVER_ERRORS.INTERNAL_SERVER_ERROR);
    }
}
