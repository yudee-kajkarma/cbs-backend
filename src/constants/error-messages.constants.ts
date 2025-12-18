/**
 * Error Messages Constants
 * Centralized error messages for the application
 */

export const ERROR_MESSAGES = {
  // Client Errors (4xx)
  CLIENT_ERRORS: {
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
    
    // License Errors
    LICENSE_NOT_FOUND: {
      code: 'CBS-4008',
      message: 'License not found',
      status: 404
    },
    
    // Network Equipment Errors
    NETWORK_EQUIPMENT_NOT_FOUND: {
      code: 'CBS-4009',
      message: 'Network equipment not found',
      status: 404
    },
    NETWORK_EQUIPMENT_EXISTS: {
      code: 'CBS-4010',
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
    
    // Telex Transfer Errors
    TELEX_TRANSFER_NOT_FOUND: {
      code: 'CBS-4020',
      message: 'Telex transfer not found',
      status: 404
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
  }
}
