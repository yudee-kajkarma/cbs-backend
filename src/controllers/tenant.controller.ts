import { Request, Response } from 'express';
import { TenantService } from '../services/tenant.service';
import { throwError } from '../utils/errors.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { INFO_MESSAGES } from '../constants/info-messages.constants';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { toDto, toDtoList } from '../utils/dto-mapper.util';
import { TenantResponseDto, GetAllTenantsResponseDto, TenantCreationResponseDto, TenantStatsResponseDto } from '../dtos/tenant-dto';

/**
 * Tenant Controller
 */
export class TenantController {
  /**
   * Create a new tenant
   * POST /api/tenants
   * Public endpoint - allows self-service tenant registration
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const tenant = await TenantService.create(req.body);

      const responseData: TenantCreationResponseDto = {
        tenant: toDto(TenantResponseDto, tenant),
        adminUser: {
          username: req.body.username,
          email: tenant.companyEmail,
          fullName: tenant.companyName,
          role: 'admin',
          message: INFO_MESSAGES.TENANT.ADMIN_USER_PENDING,
        },
      };

      const response = ResponseUtil.success(INFO_MESSAGES.TENANT.CREATED_SUCCESSFULLY, responseData);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all tenants with filtering and pagination
   * GET /api/tenants
   * Protected by requireSuperAdmin middleware
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await TenantService.findAll(query);

      const tenantsDto = toDtoList(TenantResponseDto, result.tenants);

      const responseData: GetAllTenantsResponseDto = {
        tenants: tenantsDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.TENANT.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get tenant by ID
   * GET /api/tenants/:id
   * Protected by requireSuperAdmin middleware
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant = await TenantService.findById(id);

      if (!tenant) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_NOT_FOUND);
      }

      const tenantDto = toDto(TenantResponseDto, tenant);
      const response = ResponseUtil.success(INFO_MESSAGES.TENANT.RETRIEVED_SUCCESSFULLY, tenantDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update tenant
   * PUT /api/tenants/:id
   * Protected by requireSuperAdmin middleware
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant = await TenantService.update(id, req.body);

      if (!tenant) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_NOT_FOUND);
      }

      const tenantDto = toDto(TenantResponseDto, tenant);
      const response = ResponseUtil.success(INFO_MESSAGES.TENANT.UPDATED_SUCCESSFULLY, tenantDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Activate tenant
   * POST /api/tenants/:id/activate
   * Protected by requireSuperAdmin middleware
   */
  static async activate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant = await TenantService.activate(id);

      if (!tenant) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_NOT_FOUND);
      }

      const tenantDto = toDto(TenantResponseDto, tenant);
      const response = ResponseUtil.success(INFO_MESSAGES.TENANT.ACTIVATED_SUCCESSFULLY, tenantDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'activate', id: req.params.id });
    }
  }

  /**
   * Suspend tenant
   * POST /api/tenants/:id/suspend
   * Protected by requireSuperAdmin middleware
   */
  static async suspend(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant = await TenantService.suspend(id);

      if (!tenant) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_NOT_FOUND);
      }

      const tenantDto = toDto(TenantResponseDto, tenant);
      const response = ResponseUtil.success(INFO_MESSAGES.TENANT.SUSPENDED_SUCCESSFULLY, tenantDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'suspend', id: req.params.id });
    }
  }

  /**
   * Delete tenant permanently
   * DELETE /api/tenants/:id
   * Protected by requireSuperAdmin middleware
   * 
   * Requires { confirm: "PERMANENTLY_DELETE" } in request body
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      if (req.body.confirm !== 'PERMANENTLY_DELETE') {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_CONFIRMATION_REQUIRED);
      }

      const { id } = req.params;
      await TenantService.permanentlyDelete(id);

      const response = ResponseUtil.success(INFO_MESSAGES.TENANT.PERMANENTLY_DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }

  /**
   * Get tenant statistics
   * GET /api/tenants/stats
   * Protected by requireSuperAdmin middleware
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await TenantService.getStats();
      const statsDto = toDto(TenantStatsResponseDto, stats);
      const response = ResponseUtil.success(INFO_MESSAGES.TENANT.STATS_RETRIEVED_SUCCESSFULLY, statsDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getStats' });
    }
  }
}
