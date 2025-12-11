import { ISOModel } from "../models/iso.model";
import { allowedISOStandards } from "../dto/iso.dto";
import {
  uploadBufferToS3,
  getPresignedUrl,
  deleteFromS3,
} from "../utils/s3.util";
import { paginate, validatePaginationParams, parseSortParams } from "../utils/pagination.util";

export interface CreateISOInput {
  certificateName: string;
  isoStandard: string;
  issueDate: Date;
  expiryDate: Date;
  certifyingBody: string;
}

export interface UpdateISOInput {
  certificateName?: string;
  isoStandard?: string;
  issueDate?: Date;
  expiryDate?: Date;
  certifyingBody?: string;
}

const calculateStatus = (expiryDate: Date): string => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) return "Expired";
  if (diffDays <= 30) return "Expiring Soon";
  return "Active";
};

export const create = async (
  data: CreateISOInput,
  file?: Express.Multer.File
) => {
  if (!allowedISOStandards.includes(data.isoStandard)) {
    throw new Error("Invalid ISO Standard");
  }

  if (!file) {
    throw new Error("File is required");
  }

  const fileKey = await uploadBufferToS3(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  const iso = await ISOModel.create({
    ...data,
    fileKey,
  });

  return iso.toObject();
};

export const getAll = async (page: number, limit: number, query: any) => {
  // Validate pagination parameters
  const validation = validatePaginationParams(page, limit);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const {
    certificateName,
    status,
    isoStandard,
    certifyingBody,
    issueDateFrom,
    issueDateTo,
    expiryDateFrom,
    expiryDateTo,
    orderBy,
    sortBy
  } = query;

  let filter: any = {};

  if (certificateName) {
    filter.certificateName = { $regex: certificateName, $options: "i" };
  }

  if (isoStandard) {
    filter.isoStandard = isoStandard;
  }

  if (certifyingBody) {
    filter.certifyingBody = { $regex: certifyingBody, $options: "i" };
  }

  // Issue Date Range
  if (issueDateFrom || issueDateTo) {
    filter.issueDate = {};
    if (issueDateFrom) filter.issueDate.$gte = new Date(issueDateFrom);
    if (issueDateTo) filter.issueDate.$lte = new Date(issueDateTo);
  }

  // Expiry Date Range - Build incrementally to avoid overwriting
  if (expiryDateFrom || expiryDateTo || status) {
    if (!filter.expiryDate) filter.expiryDate = {};

    // User-provided date range
    if (expiryDateFrom) filter.expiryDate.$gte = new Date(expiryDateFrom);
    if (expiryDateTo) filter.expiryDate.$lte = new Date(expiryDateTo);

    // Status filter - only apply if no explicit date range provided
    if (status && !expiryDateFrom && !expiryDateTo) {
      const now = new Date();
      const soon = new Date();
      soon.setDate(now.getDate() + 30);

      if (status === "Expired") {
        filter.expiryDate.$lte = now;
      } else if (status === "Expiring Soon") {
        filter.expiryDate.$gte = now;
        filter.expiryDate.$lte = soon;
      } else if (status === "Active") {
        filter.expiryDate.$gt = soon;
      }
    }
  }

  // Parse sorting parameters
  const sort = orderBy && sortBy 
    ? parseSortParams(orderBy, sortBy) 
    : { createdAt: -1 as const };

  // Use pagination utility
  const { data: isos, pagination } = await paginate(ISOModel, filter, {
    page,
    limit,
    sort,
  });

  // Optimize: Don't generate presigned URLs for list view
  const formatted = isos.map((iso) => ({
    ...iso,
    status: calculateStatus(iso.expiryDate),
    hasFile: !!iso.fileKey, 
  }));

  return {
    isos: formatted,
    pagination,
  };
};


export const getOne = async (id: string) => {
  const iso = await ISOModel.findById(id).lean();
  if (!iso) return null;

  return {
    ...iso,
    status: calculateStatus(iso.expiryDate),
    fileUrl: iso.fileKey ? await getPresignedUrl(iso.fileKey) : null,
  };
};

export const update = async (
  id: string,
  data: UpdateISOInput,
  file?: Express.Multer.File
) => {
  const existing = await ISOModel.findById(id);
  if (!existing) return null;

  if (data.isoStandard && !allowedISOStandards.includes(data.isoStandard)) {
    throw new Error("Invalid ISO Standard");
  }

  let fileKey = existing.fileKey;

  if (file) {
    if (existing.fileKey) await deleteFromS3(existing.fileKey);
    fileKey = await uploadBufferToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );
  }

  const updated = await ISOModel.findByIdAndUpdate(
    id,
    { ...data, fileKey },
    { new: true, lean: true }
  );

  if (!updated) return null;

  return {
    ...updated,
    status: calculateStatus(updated.expiryDate),
    fileUrl: updated.fileKey ? await getPresignedUrl(updated.fileKey) : null,
  };
};

export const remove = async (id: string) => {
  const existing = await ISOModel.findById(id);
  if (!existing) return null;

  const fileKey = existing.fileKey;
  
  // Delete from DB first
  await ISOModel.findByIdAndDelete(id);
  
  // Then delete from S3 (best effort)
  if (fileKey) {
    try {
      await deleteFromS3(fileKey);
    } catch (error) {
      console.error('Failed to delete S3 file:', fileKey, error);
    }
  }

  return true;
};
