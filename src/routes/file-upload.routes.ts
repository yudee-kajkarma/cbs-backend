import { Router } from 'express';
import { FileUploadController } from '../controllers/file-upload.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { presignedUrlRequestSchema, downloadUrlRequestSchema } from '../validators/file-upload.validator';

const router = Router();

// Generate presigned URLs - Any authenticated user
router.post(
  '/presigned-urls',
  authenticate,
  requireAnyRole,
  validateRequest(presignedUrlRequestSchema),
  FileUploadController.generatePresignedUrls
);

// Download URL - Any authenticated user
router.post(
  '/download',
  authenticate,
  requireAnyRole,
  validateRequest(downloadUrlRequestSchema),
  FileUploadController.generateDownloadUrl
);

// Delete files - Any authenticated user
router.delete('/delete', authenticate, requireAnyRole, FileUploadController.deleteFiles);

// Get file info - Any authenticated user
router.post(
  '/info',
  authenticate,
  requireAnyRole,
  validateRequest(downloadUrlRequestSchema),
  FileUploadController.getFileInfo
);

export default router;
