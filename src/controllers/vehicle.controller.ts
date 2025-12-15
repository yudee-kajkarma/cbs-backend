import { Request, Response } from "express";
import { VehicleService } from "../services/vehicle.service";
import { VehicleResponseDto, GetAllVehicleResponseDto } from "../dtos";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class VehicleController {
  /**
   * Create a new vehicle
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await VehicleService.create(req.body);
      const vehicleDto = toDto(VehicleResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.VEHICLE.CREATED_SUCCESSFULLY, vehicleDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get vehicle by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await VehicleService.getById(id);
      const vehicleDto = toDto(VehicleResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.VEHICLE.RETRIEVED_SUCCESSFULLY, vehicleDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all vehicles with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await VehicleService.getAll(query);

      const vehiclesDto = toDtoList(VehicleResponseDto, result.vehicles);

      const responseData: GetAllVehicleResponseDto = {
        vehicles: vehiclesDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.VEHICLE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update vehicle by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await VehicleService.update(id, req.body);
      const vehicleDto = toDto(VehicleResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.VEHICLE.UPDATED_SUCCESSFULLY, vehicleDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete vehicle by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await VehicleService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.VEHICLE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
