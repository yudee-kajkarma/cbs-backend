import { Request, Response } from 'express';
import { FileUploadService } from '../services/file-upload.service';
import { ErrorHandler } from '../utils/error-handler.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { PresignedUrlRequest } from '../interfaces/file-upload.interface';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class FileUploadController {
  /**
   * Generate presigned URLs for file uploads
   */
  static async generatePresignedUrls(req: Request, res: Response): Promise<void> {
    try {
      const request: PresignedUrlRequest = req.body;
      const result = await FileUploadService.generatePresignedUrls(request);
      const response = ResponseUtil.success(INFO_MESSAGES.FILE_UPLOAD.PRESIGNED_URLS_GENERATED_SUCCESSFULLY, result);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'generatePresignedUrls', data: req.body });
    }
  }

  /**
   * Generate download URL for a file
   */
  static async generateDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { key, expiresIn } = req.body;
      const url = await FileUploadService.generateDownloadUrl(key, expiresIn);
      const response = ResponseUtil.success(INFO_MESSAGES.FILE_UPLOAD.DOWNLOAD_URL_GENERATED_SUCCESSFULLY, { url });
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'generateDownloadUrl', data: req.body });
    }
  }

  /**
   * Delete files
   */
  static async deleteFiles(req: Request, res: Response): Promise<void> {
    try {
      const { keys } = req.body;
      if (!keys || !Array.isArray(keys)) {
        throw new Error('Keys array is required');
      }
      await FileUploadService.deleteFiles(keys);
      const response = ResponseUtil.success(INFO_MESSAGES.FILE_UPLOAD.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'deleteFiles', data: req.body });
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.body;
      const result = await FileUploadService.getFileInfo(key);
      const response = ResponseUtil.success(INFO_MESSAGES.FILE_UPLOAD.RETRIEVED_SUCCESSFULLY, result);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getFileInfo', data: req.body });
    }
  }
}
