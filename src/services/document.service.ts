import DocumentModel from "../models/document.model";
import { FileUploadService } from "./file-upload.service";
import { validateS3Keys } from "../utils/aws.util";
import { PaginationService } from './pagination.service';
import { throwError } from '../utils/errors.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { IDocument, DocumentQuery, CreateDocumentData, UpdateDocumentData } from '../interfaces/model.interface';

export class DocumentService {
  /**
   * Helper: Calculate document status
   */
  private static getStatus(documentDate?: Date): string {
    if (!documentDate) return "Archived";
    const today = new Date();
    return new Date(documentDate) < today ? "Archived" : "Active";
  }

  /**
   * Helper: Format document for list view (without S3 calls)
   */
  private static formatDocumentForList(doc: IDocument) {
    return {
      ...doc,
     status: this.getStatus(doc.documentDate),
     hasFile: !!doc.fileKey,
    };

  }

  /**
   * Helper: Format document with S3 URL
   */
  private static async formatDocument(doc: IDocument) {
    return {
      ...doc,
     status: this.getStatus(doc.documentDate),
    fileUrl: doc.fileKey ? await FileUploadService.generateDownloadUrl(doc.fileKey) : null,
  }
  }

  /**
   * Create a new document
   */
  static async create(data: CreateDocumentData): Promise<IDocument> {
    try {
      if (data.fileKey) {
        await validateS3Keys([data.fileKey]);
      }

      const doc = await DocumentModel.create(data);
      return doc.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'DocumentService', method: 'create', data });
    }
  }

  /**
   * Get all documents with pagination and filtering
   */
  static async getAll(query: DocumentQuery): Promise<any> {
    try {
      const searchableFields = ['name', 'partiesInvolved'];
      const allowedSortFields = ['name', 'category', 'documentDate', 'createdAt', 'updatedAt'];
      const filterFields = ['category', 'status'];

      const result = await PaginationService.paginate(DocumentModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Format documents without expensive S3 calls
      const formatted = result.data.map((d) => this.formatDocumentForList(d as IDocument));

      return {
        documents: formatted,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'DocumentService', method: 'getAll', query });
    }
  }

  /**
   * Get document by ID
   */
  static async getOne(id: string): Promise<any> {
    try {
      const doc = await DocumentModel.findById(id).lean();
      
      if (!doc) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.DOCUMENT_NOT_FOUND);
      }

      return await this.formatDocument(doc as unknown as IDocument);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'DocumentService', method: 'getOne', id });
    }
  }

  /**
   * Update document by ID
   */
  static async update(id: string, data: UpdateDocumentData): Promise<any> {
    try {
      const existing = await DocumentModel.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.DOCUMENT_NOT_FOUND);
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

      const updated = await DocumentModel.findByIdAndUpdate(
        id,
        data,
        { new: true, lean: true }
      );

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.DOCUMENT_NOT_FOUND);
      }

      return await this.formatDocument(updated as unknown as IDocument);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'DocumentService', method: 'update', id, data });
    }
  }

  /**
   * Delete document by ID
   */
  static async remove(id: string): Promise<void> {
    try {
      const existing = await DocumentModel.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.DOCUMENT_NOT_FOUND);
      }

      const fileKey = existing.fileKey;
      
      await DocumentModel.findByIdAndDelete(id);
      
      if (fileKey) {
        try {
          await FileUploadService.deleteFiles([fileKey]);
        } catch (error) {
          console.error('Failed to delete S3 file:', fileKey, error);
        }
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'DocumentService', method: 'remove', id });
    }
  }

  /**
   * Get download URL for a specific document
   */
  static async getDownloadUrl(id: string): Promise<string> {
    try {
      const doc = await DocumentModel.findById(id).lean().select('fileKey');
      
      if (!doc || !doc.fileKey) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.DOCUMENT_NOT_FOUND);
      }
      
      return await FileUploadService.generateDownloadUrl(doc.fileKey);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'DocumentService', method: 'getDownloadUrl', id });
    }
  }
}
