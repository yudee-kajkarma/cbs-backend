/**
 * Error Messages Constants
 * Centralized error messages for the application
 */

export const ERROR_MESSAGES = {
  // Client Errors (4xx)
  CLIENT_ERRORS: {
    // User Errors
    USER_NOT_FOUND: {
      code: 'CBS-4000',
      message: 'User not found',
      status: 404
    },
    USER_EMAIL_EXISTS: {
      code: 'CBS-4000-1',
      message: 'User with this email already exists',
      status: 409
    },
    USER_USERNAME_EXISTS: {
      code: 'CBS-4000-2',
      message: 'User with this username already exists',
      status: 409
    },
    
    // Employee Errors
    EMPLOYEE_NOT_FOUND: {
      code: 'CBS-4000-3',
      message: 'Employee not found',
      status: 404
    },
    EMPLOYEE_SALARY_NOT_SET: {
      code: 'CBS-4000-4',
      message: 'Employee salary is not set',
      status: 400
    },
    
    // Audit Errors
    AUDIT_NOT_FOUND: {
      code: 'CBS-4001',
      message: 'Audit not found',
      status: 404
    },
    
    // Document Errors
    DOCUMENT_NOT_FOUND: {
      code: 'CBS-4002',
      message: 'Document not found',
      status: 404
    },
    
    // Furniture Errors
    FURNITURE_NOT_FOUND: {
      code: 'CBS-4003',
      message: 'Furniture item not found',
      status: 404
    },
    FURNITURE_ITEMCODE_EXISTS: {
      code: 'CBS-4004',
      message: 'Item code already exists',
      status: 409
    },
    
    // Hardware Errors
    HARDWARE_NOT_FOUND: {
      code: 'CBS-4005',
      message: 'Hardware not found',
      status: 404
    },
    
    // Hardware Transfer Errors
    HARDWARE_TRANSFER_NOT_FOUND: {
      code: 'CBS-4006',
      message: 'Hardware transfer not found',
      status: 404
    },
    
    // ISO Errors
    ISO_NOT_FOUND: {
      code: 'CBS-4007',
      message: 'ISO certificate not found',
      status: 404
    },
    
    // Leave Balance Errors
    LEAVE_BALANCE_NOT_FOUND: {
      code: 'CBS-4008',
      message: 'Leave balance not found',
      status: 404
    },
    LEAVE_BALANCE_EXISTS: {
      code: 'CBS-4008-1',
      message: 'Leave balance already exists for this employee and year',
      status: 400
    },
    INSUFFICIENT_LEAVE_BALANCE: {
      code: 'CBS-4008-2',
      message: 'Insufficient leave balance',
      status: 400
    },
    
    // Leave Policy Errors
    LEAVE_POLICY_NOT_FOUND: {
      code: 'CBS-4008-3',
      message: 'Leave policy not found',
      status: 404
    },
    LEAVE_POLICY_EXISTS: {
      code: 'CBS-4008-3-1',
      message: 'Leave policy already exists. Only one policy is allowed.',
      status: 400
    },
    
    // Attendance Policy Errors
    ATTENDANCE_POLICY_NOT_FOUND: {
      code: 'CBS-4008-4',
      message: 'Attendance policy not found',
      status: 404
    },
    ATTENDANCE_POLICY_EXISTS: {
      code: 'CBS-4008-4-1',
      message: 'Attendance policy already exists. Only one policy is allowed.',
      status: 400
    },
    
    // Metadata Errors
    METADATA_NOT_FOUND: {
      code: 'CBS-4008-5',
      message: 'Metadata not found',
      status: 404
    },
    
    // Payroll Compensation Errors
    PAYROLL_COMPENSATION_NOT_FOUND: {
      code: 'CBS-4008-6',
      message: 'Payroll compensation settings not found',
      status: 404
    },
    PAYROLL_COMPENSATION_EXISTS: {
      code: 'CBS-4008-5-1',
      message: 'Payroll compensation settings already exist. Only one configuration is allowed.',
      status: 400
    },
    
    // Leave Application Errors
    LEAVE_APPLICATION_NOT_FOUND: {
      code: 'CBS-4008-4',
      message: 'Leave application not found',
      status: 404
    },
    INVALID_DATE_RANGE: {
      code: 'CBS-4008-5',
      message: 'Invalid date range',
      status: 400
    },
    OVERLAPPING_LEAVE: {
      code: 'CBS-4008-6',
      message: 'Overlapping leave application found',
      status: 400
    },
    LEAVE_APPLICATION_CANNOT_MODIFY: {
      code: 'CBS-4008-7',
      message: 'Cannot modify leave application that has been approved or rejected',
      status: 400
    },
    
    // Monthly Payroll Errors
    MONTHLY_PAYROLL_NOT_FOUND: {
      code: 'CBS-4009',
      message: 'Monthly payroll not found',
      status: 404
    },
    MONTHLY_PAYROLL_ALREADY_EXISTS: {
      code: 'CBS-4009-1',
      message: 'Monthly payroll already exists for this employee and period',
      status: 409
    },
    MONTHLY_PAYROLL_ALREADY_PROCESSED: {
      code: 'CBS-4009-2',
      message: 'Monthly payroll has already been processed',
      status: 400
    },
    MONTHLY_PAYROLL_ALREADY_PAID: {
      code: 'CBS-4009-3',
      message: 'Monthly payroll has already been marked as paid',
      status: 400
    },
    
    // Employee Bonus Errors
    BONUS_NOT_FOUND: {
      code: 'CBS-4010',
      message: 'Employee bonus not found',
      status: 404
    },
    BONUS_ALREADY_EXISTS: {
      code: 'CBS-4010-1',
      message: 'Bonus already exists for this employee and period',
      status: 409
    },
    
    // Employee Incentive Errors
    INCENTIVE_NOT_FOUND: {
      code: 'CBS-4011',
      message: 'Employee incentive not found',
      status: 404
    },
    INCENTIVE_ALREADY_EXISTS: {
      code: 'CBS-4011-1',
      message: 'Incentive already exists for this employee and period',
      status: 409
    },
    
    // License Errors
    LICENSE_NOT_FOUND: {
      code: 'CBS-4012',
      message: 'License not found',
      status: 404
    },
    
    // Network Equipment Errors
    NETWORK_EQUIPMENT_NOT_FOUND: {
      code: 'CBS-4010',
      message: 'Network equipment not found',
      status: 404
    },
    NETWORK_EQUIPMENT_EXISTS: {
      code: 'CBS-4010-1',
      message: 'Network equipment already exists',
      status: 409
    },
    
    // SIM Errors
    SIM_NOT_FOUND: {
      code: 'CBS-4011',
      message: 'SIM not found',
      status: 404
    },
    
    // Software Errors
    SOFTWARE_NOT_FOUND: {
      code: 'CBS-4012',
      message: 'Software not found',
      status: 404
    },
    SOFTWARE_LICENSE_KEY_EXISTS: {
      code: 'CBS-4013',
      message: 'License key already exists',
      status: 409
    },
    
    // Support Errors
    SUPPORT_NOT_FOUND: {
      code: 'CBS-4014',
      message: 'Support ticket not found',
      status: 404
    },
    
    // Property Errors
    PROPERTY_NOT_FOUND: {
      code: 'CBS-4015',
      message: 'Property not found',
      status: 404
    },
    
    // Vehicle Errors
    VEHICLE_NOT_FOUND: {
      code: 'CBS-4016',
      message: 'Vehicle not found',
      status: 404
    },
    
    // Equipment Errors
    EQUIPMENT_NOT_FOUND: {
      code: 'CBS-4017',
      message: 'Equipment not found',
      status: 404
    },
    
    // Bank Account Errors
    BANK_ACCOUNT_NOT_FOUND: {
      code: 'CBS-4018',
      message: 'Bank account not found',
      status: 404
    },
    BANK_ACCOUNT_EXISTS: {
      code: 'CBS-4019',
      message: 'Bank account with this account number already exists',
      status: 409
    },
    BULK_UPDATE_INVALID: {
      code: 'CBS-4019-1',
      message: 'Updates array is required and cannot be empty',
      status: 400
    },

    // Bank Balance Errors
    BANK_BALANCE_NOT_FOUND: {
      code: 'CBS-4025',
      message: 'Bank balance entry not found',
      status: 404
    },
    
    // Telex Transfer Errors
    TELEX_TRANSFER_NOT_FOUND: {
      code: 'CBS-4020',
      message: 'Telex transfer not found',
      status: 404
    },
    
    // Forecast Errors
    FORECAST_NOT_FOUND: {
      code: 'CBS-4022',
      message: 'Forecast entry not found',
      status: 404
    },
    INVALID_CSV_FORMAT: {
      code: 'CBS-4023',
      message: 'Invalid CSV format. Please ensure the file contains proper headers and data.',
      status: 400
    },
    INVALID_CSV_HEADERS: {
      code: 'CBS-4024',
      message: 'Invalid CSV headers. Required headers: Date, Type, Category, Description, Amount, Currency, Bank Account, Status',
      status: 400
    },
    // Cheque Errors
    CHEQUE_NOT_FOUND: {
      code: 'CBS-4020',
      message: 'Cheque not found',
      status: 404
    },
    CHEQUE_NUMBER_EXISTS: {
      code: 'CBS-4021',
      message: 'Cheque number already exists for this bank account',
      status: 409
    },
    // Payee Errors
    PAYEE_NOT_FOUND: {
      code: 'CBS-4020',
      message: 'Payee not found',
      status: 404
    },
    
    // Validation Errors
    VALIDATION_FAILED: {
      code: 'CBS-4000',
      message: 'Validation failed',
      status: 400
    },
    INVALID_ID: {
      code: 'CBS-4018',
      message: 'Invalid ID format',
      status: 400
    },
    INVALID_DATE_FORMAT: {
      code: 'CBS-4019',
      message: 'Invalid date format. Use DD-MM-YYYY',
      status: 400
    },
    
    // File Upload Errors
    INVALID_FILE_METADATA: {
      code: 'CBS-4020',
      message: 'Invalid file metadata',
      status: 400
    },
    INVALID_FILE_TYPE: {
      code: 'CBS-4021',
      message: 'Invalid file type',
      status: 400
    },
    FILE_TOO_LARGE: {
      code: 'CBS-4022',
      message: 'File too large',
      status: 400
    },
    INVALID_FILE_FORMAT: {
      code: 'CBS-4023',
      message: 'Invalid file format',
      status: 400
    },
    INVALID_FILENAME: {
      code: 'CBS-4021',
      message: 'Invalid filename',
      status: 400
    },
    TOO_MANY_FILES: {
      code: 'CBS-4022',
      message: 'Too many files',
      status: 400
    },
    FILE_NOT_FOUND: {
      code: 'CBS-4023',
      message: 'File not found',
      status: 404
    },
    INVALID_S3_KEYS: {
      code: 'CBS-4024',
      message: 'Invalid S3 keys',
      status: 400
    },
    INVALID_ISO_STANDARD: {
      code: 'CBS-4025',
      message: 'Invalid ISO standard',
      status: 400
    },
    INVALID_OPERATION: {
      code: 'CBS-4026',
      message: 'Invalid operation',
      status: 400
    },
    UNAUTHORIZED_ACTION: {
      code: 'CBS-4027',
      message: 'You do not have permission to perform this action',
      status: 403
    },
    INVALID_INPUT: {
      code: 'CBS-4027',
      message: 'Invalid input',
      status: 400
    },
    
    // Attendance Errors
    ATTENDANCE_NOT_FOUND: {
      code: 'CBS-4030',
      message: 'Attendance record not found',
      status: 404
    },
    ATTENDANCE_ALREADY_CHECKED_IN: {
      code: 'CBS-4031',
      message: 'Already checked in for today',
      status: 409
    },
    ATTENDANCE_NOT_CHECKED_IN: {
      code: 'CBS-4032',
      message: 'Not checked in yet',
      status: 400
    },
    ATTENDANCE_ALREADY_CHECKED_OUT: {
      code: 'CBS-4033',
      message: 'Already checked out for today',
      status: 409
    },
    INVALID_NETWORK_CONNECTION: {
      code: 'CBS-4034',
      message: 'Check-in/Check-out must be done from company network',
      status: 403
    },
    ATTENDANCE_ALREADY_EXISTS: {
      code: 'CBS-4035',
      message: 'Attendance record already exists for this date',
      status: 409
    },
    INVALID_ATTENDANCE_ACTION: {
      code: 'CBS-4036',
      message: 'Invalid action. Must be check-in or check-out',
      status: 400
    },
    // Role Errors
    ROLE_NOT_FOUND: {
      code: 'CBS-4028',
      message: 'Role not found',
      status: 404
    },
    ROLE_NAME_ALREADY_EXISTS: {
      code: 'CBS-4029',
      message: 'Role name already exists',
      status: 409
    },
    CANNOT_MODIFY_SYSTEM_ROLE: {
      code: 'CBS-4030',
      message: 'Cannot modify or delete system role',
      status: 400
    },
    INVALID_PERMISSION_VALUE: {
      code: 'CBS-4031',
      message: 'Invalid permission value. Must be 0 (NONE), 2 (READ), or 4 (WRITE)',
      status: 400
    },
    INVALID_FEATURE_NAME: {
      code: 'CBS-4032',
      message: 'Invalid feature name',
      status: 400
    },
    INVALID_MODULE: {
      code: 'CBS-4033',
      message: 'Invalid module',
      status: 400
    },
    SETTINGS_ADMIN_ONLY: {
      code: 'CBS-4034',
      message: 'Settings module can only be accessed by ADMIN role',
      status: 403
    },
    PERMISSION_DENIED: {
      code: 'CBS-4035',
      message: 'Permission denied',
      status: 403
    },
    DEFAULT_ROLES_ALREADY_EXIST: {
      code: 'CBS-4036',
      message: 'Default roles already exist',
      status: 409
    },
    
    // Authentication Errors
    INVALID_CREDENTIALS: {
      code: 'CBS-4037',
      message: 'Invalid username or password',
      status: 401
    },
    TOKEN_EXPIRED: {
      code: 'CBS-4038',
      message: 'Token has expired',
      status: 401
    },
    INVALID_TOKEN: {
      code: 'CBS-4039',
      message: 'Invalid token',
      status: 401
    },
    TOKEN_REQUIRED: {
      code: 'CBS-4040',
      message: 'Authentication token is required',
      status: 401
    },
  },
  
  // Server Errors (5xx)
  SERVER_ERRORS: {
    INTERNAL_SERVER_ERROR: {
      code: 'CBS-5000',
      message: 'Something went wrong',
      status: 500
    },
    DOCUMENT_UPLOAD_FAILED: {
      code: 'CBS-5001',
      message: 'Document upload failed',
      status: 500
    },
    DOCUMENT_DELETE_FAILED: {
      code: 'CBS-5002',
      message: 'Document delete failed',
      status: 500
    },
    ISO_UPLOAD_FAILED: {
      code: 'CBS-5003',
      message: 'ISO certificate upload failed',
      status: 500
    },
    ISO_DELETE_FAILED: {
      code: 'CBS-5004',
      message: 'ISO certificate delete failed',
      status: 500
    },
    FAILED_TO_GENERATE_PRESIGNED_URL: {
      code: 'CBS-5005',
      message: 'Failed to generate presigned URL',
      status: 500
    },
    FAILED_TO_VERIFY_FILES: {
      code: 'CBS-5006',
      message: 'Failed to verify files',
      status: 500
    },
    FAILED_TO_DELETE_FILES: {
      code: 'CBS-5007',
      message: 'Failed to delete files',
      status: 500
    },
    FAILED_TO_GENERATE_DOWNLOAD_URL: {
      code: 'CBS-5008',
      message: 'Failed to generate download URL',
      status: 500
    },
    CURRENCY_CONVERSION_FAILED: {
      code: 'CBS-5009',
      message: 'Currency conversion failed',
      status: 500
    },
    EMPLOYEE_AUTO_CREATION_FAILED: {
      code: 'CBS-5010',
      message: 'Error auto-creating employee',
      status: 500
    },
    USER_ID_GENERATION_FAILED: {
      code: 'CBS-5011',
      message: 'Failed to generate unique user ID after multiple attempts',
      status: 500
    },
    EMPLOYEE_ID_GENERATION_FAILED: {
      code: 'CBS-5012',
      message: 'Failed to generate unique employee ID after multiple attempts',
      status: 500
    },
    LEAVE_REQUEST_ID_GENERATION_FAILED: {
      code: 'CBS-5013',
      message: 'Failed to generate unique leave request ID after multiple attempts',
      status: 500
    },
  }
}
