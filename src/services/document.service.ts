import DocumentModel from "../models/document.model";
import { uploadBufferToS3, deleteFromS3, getPresignedUrl } from "../utils/s3.util";
import { paginate, parseSortParams } from "../utils/pagination.util";

type GetAllResult = {
  documents: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

const getStatus = (documentDate?: Date) => {
  if (!documentDate) return "Archived";
  const today = new Date();
  return new Date(documentDate) < today ? "Archived" : "Active";
};

export const create = async (data: any, file?: Express.Multer.File) => {
  let fileKey: string | undefined;
  if (file) {
    fileKey = await uploadBufferToS3(file.buffer, file.originalname, file.mimetype);
  }

  const doc = await DocumentModel.create({
    ...data,
    fileKey,
  });

  return doc.toObject();
};

export const getAll = async (
  page = 1,
  limit = 10,
  filters: {
    search?: string;
    name?: string;
    category?: string;
    status?: string;
    orderBy?: string;
    sortBy?: string;
  } = {}
): Promise<GetAllResult> => {
  // Build mongoose filter for DB-level searchable fields
  const dbFilter: any = {};

  if (filters.category) {
    dbFilter.category = { $regex: filters.category, $options: "i" };
  }

  if (filters.name) {
    dbFilter.name = { $regex: filters.name, $options: "i" };
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    dbFilter.$or = [{ name: regex }, { partiesInvolved: regex }];
  }

  // Handle status filtering at DB level if possible
  if (filters.status) {
    const today = new Date();
    if (filters.status.toLowerCase() === 'archived') {
      dbFilter.documentDate = { $lt: today };
    } else if (filters.status.toLowerCase() === 'active') {
      dbFilter.documentDate = { $gte: today };
    }
  }

  // Use pagination utility with sorting
  const sortQuery = parseSortParams(filters.orderBy || 'createdAt', filters.sortBy || 'desc');
  const { data: docs, pagination: paginationMeta } = await paginate(DocumentModel, dbFilter, {
    page,
    limit,
    sort: sortQuery,
  });

  // Optimize: Don't generate presigned URLs for list view
  // Compute only status (cheap operation)
  const docsWithExtras = docs.map((d) => {
    const status = getStatus(d.documentDate);
    const { fileKey, ...rest } = d;

    return {
      ...rest,
      status,
      hasFile: !!fileKey, // Just indicate if file exists
    };
  });

  return {
    documents: docsWithExtras,
    pagination: paginationMeta,
  };
};


export const getOne = async (id: string) => {
  const doc = await DocumentModel.findById(id).lean();
  if (!doc) return null;

  const status = getStatus(doc.documentDate);
  const fileUrl = doc.fileKey ? await getPresignedUrl(doc.fileKey) : null;

  const { fileKey, ...rest } = doc;

  return {
    ...rest,
    fileKey, // include if you want; remove this to hide
    status,
    fileUrl,
  };
};

export const update = async (id: string, data: any, file?: Express.Multer.File) => {
  const existing = await DocumentModel.findById(id);
  if (!existing) return null;

  let fileKey = existing.fileKey;
  if (file) {
    if (fileKey) {
      await deleteFromS3(fileKey);
    }
    fileKey = await uploadBufferToS3(file.buffer, file.originalname, file.mimetype);
  }

  const updated = await DocumentModel.findByIdAndUpdate(
    id,
    { ...data, fileKey },
    { new: true, lean: true }
  );

  if (!updated) return null;

  const fileUrl = updated.fileKey ? await getPresignedUrl(updated.fileKey) : null;
  const status = getStatus(updated.documentDate);

  const { fileKey: fk, ...rest } = updated;

  return {
    ...rest,
    fileKey: fk, // include if desired
    status,
    fileUrl,
  };
};

export const remove = async (id: string) => {
  const existing = await DocumentModel.findById(id);
  if (!existing) return null;

  const fileKey = existing.fileKey;
  
  // Delete from DB first
  await DocumentModel.findByIdAndDelete(id);
  
  // Then delete from S3 (best effort - don't fail if S3 delete fails)
  if (fileKey) {
    try {
      await deleteFromS3(fileKey);
    } catch (error) {
      console.error('Failed to delete S3 file:', fileKey, error);
      // Don't throw - DB deletion already succeeded
    }
  }

  return true;
};

/**
 * Get download URL for a specific document
 */
export const getDownloadUrl = async (id: string): Promise<string | null> => {
  const doc = await DocumentModel.findById(id).lean().select('fileKey');
  if (!doc || !doc.fileKey) return null;
  
  return await getPresignedUrl(doc.fileKey);
};

/**
 * OPTIMIZATION: Batch generate presigned URLs for multiple documents
 * Use this when frontend needs URLs for multiple items (e.g., bulk download)
 */
export const generatePresignedUrls = async (fileKeys: string[]): Promise<Record<string, string>> => {
  const urlPromises = fileKeys.map(async (key) => {
    try {
      const url = await getPresignedUrl(key);
      return { key, url };
    } catch (error) {
      console.error(`Failed to generate URL for ${key}:`, error);
      return { key, url: null };
    }
  });

  const results = await Promise.all(urlPromises);
  return results.reduce((acc, { key, url }) => {
    if (url) acc[key] = url;
    return acc;
  }, {} as Record<string, string>);
};
