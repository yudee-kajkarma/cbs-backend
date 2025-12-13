import { Request, Response } from "express";
import { PropertyService } from "../services/property.service";
import { PropertyResponseDto, GetAllPropertyResponseDto } from "../dtos";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class PropertyController {
  /**
   * Create a new property
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await PropertyService.create(req.body);
      const propertyDto = toDto(PropertyResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PROPERTY.CREATED_SUCCESSFULLY, propertyDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get property by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await PropertyService.getById(id);
      const propertyDto = toDto(PropertyResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PROPERTY.RETRIEVED_SUCCESSFULLY, propertyDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all properties with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await PropertyService.getAll(query);

      const propertiesDto = toDtoList(PropertyResponseDto, result.properties);

      const responseData: GetAllPropertyResponseDto = {
        properties: propertiesDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.PROPERTY.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update property by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await PropertyService.update(id, req.body);
      const propertyDto = toDto(PropertyResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PROPERTY.UPDATED_SUCCESSFULLY, propertyDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete property by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await PropertyService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.PROPERTY.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
