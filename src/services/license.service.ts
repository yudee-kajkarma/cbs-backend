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

export const getAll = async (page: number, limit: number, filters: any) => {
  const skip = (page - 1) * limit;

  const query: any = {};

  // FILTER: by type
  if (filters.type) {
    query.type = { $regex: filters.type, $options: "i" };
  }

  // FILTER: by name
  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  // FILTER: search (name/number/issuingAuthority)
  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [
      { name: regex },
      { number: regex },
      { issuingAuthority: regex },
    ];
  }

  // 1) Fetch from DB (without status filter)
  const rawData = await License.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const today = new Date();

  // 2) Compute status + document URL
  let data = await Promise.all(
    rawData.map(async (item) => {
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

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

  // 3) FILTER: by computed status (Active, Expiring Soon, Expired)
  if (filters.status) {
    data = data.filter(
      (item) => item.status.toLowerCase() === filters.status.toLowerCase()
    );
  }

  // 4) Pagination counts
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
