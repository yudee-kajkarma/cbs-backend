import License from "../models/license.model";
import {
  uploadBufferToS3,
  getPresignedUrl,
  deleteFromS3,
} from "../utils/s3.util";
import { paginate, calculatePagination } from "../utils/pagination.util";

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

  // Build sort query
  const sortOrder = sortBy === "asc" ? 1 : -1;
  const sortQuery: any = { [orderBy]: sortOrder };

  // Paginate at database level
  const { data: rawData, total } = await paginate(License, query, page, limit, sortQuery);

  const data = await Promise.all(
    rawData.map(async (item: any) => {
      const status = calculateStatus(item.expiryDate, today);

      return {
        ...item,
        status,
        documentUrl: item.documentKey
          ? await getPresignedUrl(item.documentKey)
          : null,
      };
    })
  );

  return {
    licenses: data,
    pagination: calculatePagination(total, page, limit),
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

  if (existing.documentKey) {
    await deleteFromS3(existing.documentKey);
  }

  await License.findByIdAndDelete(id);

  return true;
};
