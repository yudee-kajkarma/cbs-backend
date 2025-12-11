// src/services/license.service.ts
import License from "../models/license.model";
import {
  uploadBufferToS3,
  getPresignedUrl,
  deleteFromS3,
} from "../utils/s3.util";

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

// ------------------ GET ALL WITH PAGINATION + STATUS ------------------
// src/services/license.service.ts

export const getAll = async (
  page: number,
  limit: number,
  filters: any,
  orderBy: string,
  sortBy: string
) => {
  const skip = (page - 1) * limit;

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

  // NEW — sorting logic
  const sortOrder = sortBy === "asc" ? 1 : -1;
  const sortQuery: any = {};
  sortQuery[orderBy] = sortOrder;

  // Fetch data with sorting
  const rawData = await License.find(query)
    .skip(skip)
    .limit(limit)
    .sort(sortQuery)   // 👈 Sorting applied here
    .lean();

  const today = new Date();

  // Compute status + URL
  let data = await Promise.all(
    rawData.map(async (item) => {
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let status = "Active";
      if (diffDays < 0) status = "Expired";
      else if (diffDays <= 30) status = "Expiring Soon";

      return {
        ...item,
        status,
        documentUrl: item.documentKey
          ? await getPresignedUrl(item.documentKey)
          : null,
      };
    })
  );

  // Filter by computed status
  if (filters.status) {
    data = data.filter(
      (item) => item.status.toLowerCase() === filters.status.toLowerCase()
    );
  }

  const total = data.length;
  const totalPages = Math.ceil(total / limit);

  return {
    licenses: data,
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
  const license = await License.findById(id).lean();
  if (!license) return null;

  const today = new Date();
  const expiry = new Date(license.expiryDate);

  let status = "Active";
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) status = "Expired";
  else if (diffDays <= 30) status = "Expiring Soon";

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

  return {
    ...updated,
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
