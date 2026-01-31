import { Request, Response } from "express";
import { MetadataService } from "../services/metadata.service";
import { MetadataResponseDto } from "../dtos/metadata-dto";
import { toDto } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class MetadataController {
  /**
   * Create or update metadata
   */
  static async createOrUpdate(req: Request, res: Response): Promise<void> {
    try {
      const result = await MetadataService.createOrUpdate(req.body);
      const metadataDto = toDto(MetadataResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.METADATA.SAVED_SUCCESSFULLY, metadataDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'createOrUpdate', data: req.body });
    }
  }

  /**
   * Get metadata 
   */
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const result = await MetadataService.get();
      
      if (!result) {
        const response = ResponseUtil.success(INFO_MESSAGES.METADATA.NOT_FOUND, null);
        res.status(200).json(response);
        return;
      }
      
      const metadataDto = toDto(MetadataResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.METADATA.RETRIEVED_SUCCESSFULLY, metadataDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'get' });
    }
  }
}
