import { Request, Response } from "express";
import { DocumentService } from "../services/legal-docs.service";
import { DocumentResponseDto, GetAllDocumentsResponseDto } from "../dtos/legal-docs-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class DocumentController {
  /**
   * Create a new document
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await DocumentService.create(req.body);
      const documentDto = toDto(DocumentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.DOCUMENT.CREATED_SUCCESSFULLY, documentDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get document by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await DocumentService.getOne(id);
      const documentDto = toDto(DocumentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.DOCUMENT.RETRIEVED_SUCCESSFULLY, documentDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all documents with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await DocumentService.getAll(query);

      const documentsDto = toDtoList(DocumentResponseDto, result.documents);

      const responseData: GetAllDocumentsResponseDto = {
        documents: documentsDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.DOCUMENT.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update document by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await DocumentService.update(id, req.body);
      const documentDto = toDto(DocumentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.DOCUMENT.UPDATED_SUCCESSFULLY, documentDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete document by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await DocumentService.remove(id);
      const response = ResponseUtil.success(INFO_MESSAGES.DOCUMENT.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }

  /**
   * Get download URL for document
   */
  static async getDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const url = await DocumentService.getDownloadUrl(id);
      const response = ResponseUtil.success(INFO_MESSAGES.DOCUMENT.DOWNLOAD_URL_GENERATED_SUCCESSFULLY, {
        url,
        expiresIn: 900,
      });
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getDownloadUrl', id: req.params.id });
    }
  }
}
