import Joi from 'joi';

// File upload metadata validation
export const fileUploadMetadataSchema = Joi.object({
  filename: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Filename must be at least 1 character long',
    'string.max': 'Filename cannot exceed 255 characters',
    'any.required': 'Filename is required',
  }),
  mimeType: Joi.string()
    .valid(
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      // Videos
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/webm',
      // Certificates
      'application/pdf'
    )
    .required()
    .messages({
      'any.only': 'Invalid file format. Allowed formats: JPEG, PNG, WebP, GIF, MP4, AVI, MOV, WMV, WebM, PDF',
      'any.required': 'MIME type is required',
    }),
  size: Joi.number()
    .min(1)
    .max(100 * 1024 * 1024)
    .required()
    .messages({
      'number.min': 'File size must be at least 1 byte',
      'number.max': 'File size cannot exceed 100MB',
      'any.required': 'File size is required',
    }),
  fileType: Joi.string().valid('image', 'video', 'certificate').required().messages({
    'any.only': 'File type must be one of: image, video, certificate',
    'any.required': 'File type is required',
  }),
});

// Presigned URL request validation
export const presignedUrlRequestSchema = Joi.object({
  type: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Type must be at least 1 character long',
    'string.max': 'Type cannot exceed 50 characters',
    'any.required': 'Type is required',
  }),
  files: Joi.array()
    .items(fileUploadMetadataSchema)
    .min(1)
    .max(20) // Maximum 20 files per request
    .required()
    .messages({
      'array.min': 'At least one file is required',
      'array.max': 'Maximum 20 files allowed per request',
      'any.required': 'Files array is required',
    }),
});

// Download URL request validation
export const downloadUrlRequestSchema = Joi.object({
  key: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'S3 key must be at least 1 character long',
    'string.max': 'S3 key cannot exceed 1000 characters',
    'any.required': 'S3 key is required',
  }),
  expiresIn: Joi.number().min(60).max(86400).optional().messages({
    'number.min': 'Expiration time must be at least 60 seconds',
    'number.max': 'Expiration time cannot exceed 86400 seconds (24 hours)',
  }),
});
