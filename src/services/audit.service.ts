import Audit from "../models/audit.model";
import {
  uploadBufferToS3,
  getPresignedUrl,
  deleteFromS3,
} from "../utils/s3.util";
import { paginate, validatePaginationParams } from "../utils/pagination.util";

export const create = async (data: any, file?: Express.Multer.File) => {
  let fileKey;

  if (file) {
    fileKey = await uploadBufferToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );
  }

  const audit = await Audit.create({
    ...data,
    fileKey,
    periodStart: new Date(data.periodStart),
    periodEnd: new Date(data.periodEnd),
    completionDate: new Date(data.completionDate),
  });

  return audit.toObject();
};

const formatAuditForList = (item: any) => {
  const now = new Date();
  const start = new Date(item.periodStart);
  const end = new Date(item.periodEnd);
  const completion = new Date(item.completionDate);

  let status = "Scheduled";
  if (now > completion) status = "Completed";
  else if (now >= start && now <= end) status = "In Progress";

  return {
    ...item,
    status,
    hasFile: !!item.fileKey, // Just indicate if file exists
  };
};

const formatAudit = async (item: any) => {
  const now = new Date();
  const start = new Date(item.periodStart);
  const end = new Date(item.periodEnd);
  const completion = new Date(item.completionDate);

  let status = "Scheduled";
  if (now > completion) status = "Completed";
  else if (now >= start && now <= end) status = "In Progress";

  return {
    ...item,
    status,
    documentUrl: item.fileKey ? await getPresignedUrl(item.fileKey) : null,
  };
};

export const getAll = async (page: number, limit: number, filters: any) => {
  // Validate pagination parameters
  const validation = validatePaginationParams(page, limit);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const query: any = {};

  if (filters.search) {
    query.$or = [
      { name: new RegExp(filters.search, "i") },
      { type: new RegExp(filters.search, "i") },
      { auditor: new RegExp(filters.search, "i") },
    ];
  }

  if (filters.name) query.name = new RegExp(filters.name, "i");
  if (filters.type) query.type = new RegExp(filters.type, "i");
  if (filters.status) query.status = filters.status;
  if (filters.auditor) query.auditor = new RegExp(filters.auditor, "i");

  const dateFilter: any = {};

  if (filters.periodStartFrom || filters.periodStartTo) {
    dateFilter.periodStart = {};
    if (filters.periodStartFrom)
      dateFilter.periodStart.$gte = new Date(filters.periodStartFrom);
    if (filters.periodStartTo)
      dateFilter.periodStart.$lte = new Date(filters.periodStartTo);
  }

  if (filters.periodEndFrom || filters.periodEndTo) {
    dateFilter.periodEnd = {};
    if (filters.periodEndFrom)
      dateFilter.periodEnd.$gte = new Date(filters.periodEndFrom);
    if (filters.periodEndTo)
      dateFilter.periodEnd.$lte = new Date(filters.periodEndTo);
  }

  if (filters.completionFrom || filters.completionTo) {
    dateFilter.completionDate = {};
    if (filters.completionFrom)
      dateFilter.completionDate.$gte = new Date(filters.completionFrom);
    if (filters.completionTo)
      dateFilter.completionDate.$lte = new Date(filters.completionTo);
  }

  Object.assign(query, dateFilter);

  // Use pagination utility
  const { data: audits, pagination: paginationMeta } = await paginate(Audit, query, {
    page,
    limit,
    sort: { createdAt: -1 },
  });

  // Format documents without expensive S3 calls
  const formatted = audits.map((a) => formatAuditForList(a));

  return {
    audits: formatted,
    pagination: paginationMeta,
  };
};

export const getOne = async (id: string) => {
  const audit = await Audit.findById(id).lean();
  if (!audit) return null;
  return await formatAudit(audit);
};

export const update = async (
  id: string,
  data: any,
  file?: Express.Multer.File
) => {
  const existing = await Audit.findById(id);
  if (!existing) return null;

  let fileKey = existing.fileKey;

  if (file) {
    if (existing.fileKey) await deleteFromS3(existing.fileKey);
    fileKey = await uploadBufferToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );
  }

  const updated = await Audit.findByIdAndUpdate(
    id,
    {
      ...data,
      fileKey,
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

  if (!updated) return null;

  return await formatAudit(updated);
};

export const remove = async (id: string) => {
  const existing = await Audit.findById(id);
  if (!existing) return null;

  const fileKey = existing.fileKey;
  
  // Delete from DB first
  await Audit.findByIdAndDelete(id);
  
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
