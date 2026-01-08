/**
 * Activity types for user action tracking
 */
export enum ActivityType {
  // Attendance
  CHECK_IN = 'Check In',
  CHECK_OUT = 'Check Out',
  
  // Leave Applications
  LEAVE_SUBMIT = 'Leave Submit',
  LEAVE_APPROVE = 'Leave Approve',
  LEAVE_REJECT = 'Leave Reject',
  
  // Documents
  DOCUMENT_DOWNLOAD = 'Document Download',
  DOCUMENT_UPLOAD = 'Document Upload',
  
  // Cheques
  CHEQUE_CREATE = 'Cheque Create',
  CHEQUE_PRINT = 'Cheque Print',
  
  // Profile
  PROFILE_UPDATE = 'Profile Update',
  
  // Assets
  ASSET_REQUEST = 'Asset Request',
  ASSET_APPROVE = 'Asset Approve',
  
  // HR Activities
  EMPLOYEE_ONBOARD = 'Employee Onboard',
  PAYROLL_PROCESS = 'Payroll Process',
  PAYROLL_CREATE = 'Payroll Create',
  BONUS_CREATE = 'Bonus Create',
  INCENTIVE_CREATE = 'Incentive Create',
  ATTENDANCE_MARK = 'Attendance Mark',
}

export const allowedActivityTypes = Object.values(ActivityType);

/**
 * Module names for activity categorization
 */
export enum ActivityModule {
  AUTH = 'Authentication',
  ATTENDANCE = 'Attendance',
  LEAVES = 'Leaves',
  DOCUMENTS = 'Documents',
  CHEQUES = 'Cheques',
  SUPPORT = 'Support',
  PROFILE = 'Profile',
  ASSETS = 'Assets',
  PAYROLL = 'Payroll',
  HR = 'HR',
}

export const allowedActivityModules = Object.values(ActivityModule);
