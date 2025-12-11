import License from "../models/license.model";
import {
  uploadBufferToS3,
  getPresignedUrl,
  deleteFromS3,
} from "../utils/s3.util";
import { paginate, calculatePagination, parseSortParams } from "../utils/pagination.util";

// Helper function to build MongoDB query for status filtering
const buildStatusQuery = (status: string, today: Date): any => {
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  switch (status.toLowerCase()) {
    case "expired":
      return { expiryDate: { $lt: today } };
    case "expiring soon":
      return { 
        expiryDate: { 
          $gte: today, 
          $lte: thirtyDaysFromNow 
        } 
      };
    case "active":
      return { expiryDate: { $gt: thirtyDaysFromNow } };
    default:
      return {};
  }
};

const calculateStatus = (expiryDate: Date, today: Date): string => {
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 30) return "Expiring Soon";
  return "Active";
};

export const create = async (data: any, file?: Express.Multer.File) => {
  let documentKey: string | undefined;

  if (file) {
    documentKey = await uploadBufferToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );
  }

  const license = await License.create({
    ...data,
    documentKey,
  });

  return license.toObject();
};

export const getAll = async (
  page: number,
  limit: number,
  filters: any,
  orderBy: string,
  sortBy: string
) => {
  const query: any = {};

  // Type filter
  if (filters.type) {
    query.type = { $regex: filters.type, $options: "i" };
  }

  // Name filter
  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  // Search filter
  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [
      { name: regex },
      { number: regex },
      { issuingAuthority: regex },
    ];
  }

  // Apply status filter at database level
  const today = new Date();
  
  if (filters.status) {
    const statusQuery = buildStatusQuery(filters.status, today);
    Object.assign(query, statusQuery);
  }

  // Paginate at database level with sorting
  const sortQuery = parseSortParams(orderBy, sortBy);
  const { data: rawData, pagination: paginationMeta } = await paginate(License, query, {
    page,
    limit,
    sort: sortQuery,
  });

  const data = rawData.map((item: any) => {
    const status = calculateStatus(item.expiryDate, today);

    return {
      ...item,
      status,
      hasDocument: !!item.documentKey, // Just indicate if document exists
    };
  });

  return {
    licenses: data,
    pagination: paginationMeta,
  };
};




export const getOne = async (id: string) => {
  const license = await License.findById(id).lean();
  if (!license) return null;

  const today = new Date();
  const status = calculateStatus(license.expiryDate, today);

  return {
    ...license,
    status,
    documentUrl: license.documentKey
      ? await getPresignedUrl(license.documentKey)
      : null,
  };
};

export const update = async (id: string, data: any, file?: Express.Multer.File) => {
  const existing = await License.findById(id);
  if (!existing) return null;

  let documentKey = existing.documentKey;

  if (file) {
    if (existing.documentKey) {
      await deleteFromS3(existing.documentKey);
    }

    documentKey = await uploadBufferToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );
  }

  const updated = await License.findByIdAndUpdate(
    id,
    { ...data, documentKey },
    { new: true, lean: true }
  );

  if (!updated) return null;

  const today = new Date();
  const status = calculateStatus(updated.expiryDate, today);

  return {
    ...updated,
    status,
    documentUrl: updated.documentKey
      ? await getPresignedUrl(updated.documentKey)
      : null,
  };
};

export const remove = async (id: string) => {
  const existing = await License.findById(id);
  if (!existing) return null;

  const documentKey = existing.documentKey;
  
  // Delete from DB first
  await License.findByIdAndDelete(id);
  
  // Then delete from S3 (best effort - don't fail if S3 delete fails)
  if (documentKey) {
    try {
      await deleteFromS3(documentKey);
    } catch (error) {
      console.error('Failed to delete S3 file:', documentKey, error);
      // Don't throw - DB deletion already succeeded
    }
  }

  return true;
};
