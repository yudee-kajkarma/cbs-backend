import DocumentModel from "../models/document.model";
import { uploadBufferToS3, deleteFromS3, getPresignedUrl } from "../utils/s3.util";

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
  } = {}
): Promise<GetAllResult> => {
  const skip = (page - 1) * limit;

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

  // total count of matching DB filter (status not applied here because it's computed)
  const totalMatching = await DocumentModel.countDocuments(dbFilter);

  // fetch page from DB (without status filtering)
  const docs = await DocumentModel.find(dbFilter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // compute status and fileUrl
  const today = new Date();
  const docsWithExtras = await Promise.all(
    docs.map(async (d) => {
      const status = getStatus(d.documentDate);
      const fileUrl = d.fileKey ? await getPresignedUrl(d.fileKey) : null;

      // Remove fileKey from returned object if you don't want to expose it.
      // If you want to keep it for frontend, you can include it.
      const { fileKey, ...rest } = d;

      return {
        ...rest,
        fileKey, // keep if you want; remove this line to hide fileKey from response
        status,
        fileUrl,
      };
    })
  );

  // If client requested status filter, apply it in-memory (status depends on documentDate)
  let filteredDocs = docsWithExtras;
  if (filters.status) {
    filteredDocs = docsWithExtras.filter(
      (item) => item.status.toLowerCase() === filters.status!.toLowerCase()
    );
  }

  // Pagination: When status filter is applied after DB fetch, total should reflect count after status filter.
  // To give accurate total when filters.status is present, we need to compute total matching status across all DB results.
  // For simplicity and correctness: compute totalStatusCount when status filter exists by scanning entire DB matching dbFilter.
  let total = totalMatching;
  if (filters.status) {
    // compute total documents matching dbFilter across whole collection, then compute status per item to count.
    // Note: For large datasets this will be heavier. If you need high performance, consider storing status in DB.
    const allMatchingDocs = await DocumentModel.find(dbFilter).lean();
    const allWithStatusPromises = allMatchingDocs.map(async (d) => {
      const status = getStatus(d.documentDate);
      return status;
    });
    const allStatuses = await Promise.all(allWithStatusPromises);
    total = allStatuses.filter((s) => s.toLowerCase() === filters.status!.toLowerCase()).length;
  }

  const totalPages = Math.ceil(total / limit);

  // If status filter applied, return current page of filteredDocs; else return docsWithExtras
  const resultsToReturn = filters.status ? filteredDocs : docsWithExtras;

  return {
    documents: resultsToReturn,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
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

  if (existing.fileKey) {
    await deleteFromS3(existing.fileKey);
  }

  await DocumentModel.findByIdAndDelete(id);
  return true;
};
