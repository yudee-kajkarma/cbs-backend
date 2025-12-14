import { Router } from 'express';
import { FileUploadController } from '../controllers/file-upload.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { presignedUrlRequestSchema, downloadUrlRequestSchema } from '../validators/file-upload.dto';

const router = Router();

router.post('/presigned-urls', validateRequest(presignedUrlRequestSchema), FileUploadController.generatePresignedUrls);

// Use POST to send key in body instead of URL params
router.post('/download', validateRequest(downloadUrlRequestSchema), FileUploadController.generateDownloadUrl);

router.delete('/delete', FileUploadController.deleteFiles);

// Use POST to send key in body instead of URL params
router.post('/info', validateRequest(downloadUrlRequestSchema), FileUploadController.getFileInfo);

export default router;
