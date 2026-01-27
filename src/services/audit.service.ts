import { Audit } from "../models";
import { FileUploadService } from "./file-upload.service";
import { validateS3Keys } from "../utils/aws.util";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { calculateAuditStatus } from "../utils/status.util";
import { 
  AuditDocument, 
  AuditQuery, 
  CreateAuditData, 
  UpdateAuditData 
} from "../interfaces/model.interface";

export class AuditService {
  
  private static formatAuditForList(item: AuditDocument) {
    return {
      ...item,
      status: calculateAuditStatus(item.periodStart, item.periodEnd, item.completionDate),
      hasFile: !!item.fileKey,
    };
  }

  /**
   * Helper: Format audit with S3 URL
   */
  private static async formatAudit(item: AuditDocument) {
    return {
      ...item,
      status: calculateAuditStatus(item.periodStart, item.periodEnd, item.completionDate),
      documentUrl: item.fileKey ? await FileUploadService.generateDownloadUrl(item.fileKey) : null,
    };
  }

  /**
   * Create a new audit
   */
  static async create(data: CreateAuditData): Promise<AuditDocument> {
    try {
      if (data.fileKey) {
        await validateS3Keys([data.fileKey]);
      }

      const audit = await Audit.create({
        ...data,
        periodStart: data.periodStart ? new Date(data.periodStart) : undefined,
        periodEnd: data.periodEnd ? new Date(data.periodEnd) : undefined,
        completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
      });

      return audit.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AuditService', method: 'create', data });
    }
  }

  /**
   * Get audit by ID
   */
  static async getById(id: string): Promise<any> {
    try {
      const audit = await Audit.findById(id).lean();

      if (!audit) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.AUDIT_NOT_FOUND);
      }

      return await this.formatAudit(audit as AuditDocument);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AuditService', method: 'getById', id });
    }
  }

  /**
   * Get all audits with pagination and filtering
   */
  static async getAll(query: AuditQuery): Promise<any> {
    try {
      const searchableFields = ['name', 'type', 'auditor'];
      const allowedSortFields = ['name', 'type', 'auditor', 'completionDate', 'periodStart', 'periodEnd', 'createdAt', 'updatedAt'];
      const filterFields = ['type'];

      const result = await PaginationService.paginate(Audit, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Format audits without expensive S3 calls
      const formatted = result.data.map((a: any) => this.formatAuditForList(a as AuditDocument));

      return {
        audits: formatted,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AuditService', method: 'getAll', query });
    }
  }

  /**
   * Update audit by ID
   */
  static async update(
    id: string,
    data: UpdateAuditData
  ): Promise<any> {
    try {
      const existing = await Audit.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.AUDIT_NOT_FOUND);
      }

      // Handle file update
      if (data.fileKey && data.fileKey !== existing.fileKey) {
        // Validate new file
        await validateS3Keys([data.fileKey]);
        
        // Delete old file if it exists
        if (existing.fileKey) {
          await FileUploadService.deleteFiles([existing.fileKey]);
        }
      }

      const updated = await Audit.findByIdAndUpdate(
        id,
        {
          ...data,
          periodStart: data.periodStart
            ? new Date(data.periodStart)
            : existing.periodStart,
          periodEnd: data.periodEnd
            ? new Date(data.periodEnd)
            : existing.periodEnd,
          completionDate: data.completionDate
            ? new Date(data.completionDate)
            : existing.completionDate,
        },
        { new: true, lean: true }
      );

      return await this.formatAudit(updated as AuditDocument);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AuditService', method: 'update', id, data });
    }
  }

  /**
   * Delete audit by ID
   */
  static async delete(id: string): Promise<void> {
    try {
      const existing = await Audit.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.AUDIT_NOT_FOUND);
      }

      const fileKey = existing.fileKey;

      await Audit.findByIdAndDelete(id);

      if (fileKey) {
        try {
          await FileUploadService.deleteFiles([fileKey]);
        } catch (error) {
          console.error('Failed to delete S3 file:', fileKey, error);
        }
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AuditService', method: 'delete', id });
    }
  }

  /**
   * Get audit statistics for analytics
   * @returns Statistics object with counts
   */
  static async getStats() {
    try {
      const total = await Audit.countDocuments();

      return { total };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AuditService', method: 'getStats' });
    }
  }
}
