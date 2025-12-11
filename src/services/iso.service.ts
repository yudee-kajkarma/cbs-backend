import { ISOModel, allowedStandards } from "../models/iso.model";
import {
  uploadBufferToS3,
  getPresignedUrl,
  deleteFromS3,
} from "../utils/s3.util";

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
  if (!allowedStandards.includes(data.isoStandard)) {
    throw new Error("Invalid ISO Standard");
  }

  let fileKey: string | undefined;

  if (file) {
    fileKey = await uploadBufferToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );
  }

  const iso = await ISOModel.create({
    ...data,
    fileKey,
  });

  return iso.toObject();
};

export const getAll = async (page: number, limit: number, query: any) => {
  const skip = (page - 1) * limit;

  const {
    certificateName,
    status,
    isoStandard,
    certifyingBody,
    issueDateFrom,
    issueDateTo,
    expiryDateFrom,
    expiryDateTo
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

  // Expiry Date Range
  if (expiryDateFrom || expiryDateTo) {
    filter.expiryDate = {};
    if (expiryDateFrom) filter.expiryDate.$gte = new Date(expiryDateFrom);
    if (expiryDateTo) filter.expiryDate.$lte = new Date(expiryDateTo);
  }

  // STATUS FILTER — MERGING, NOT OVERWRITING
  if (status) {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 30);

    if (!filter.expiryDate) filter.expiryDate = {};

    if (status === "Expired") {
      filter.expiryDate.$lte = now;
    }

    if (status === "Expiring Soon") {
      filter.expiryDate.$gte = now;
      filter.expiryDate.$lte = soon;
    }

    if (status === "Active") {
      filter.expiryDate.$gt = soon;
    }
  }

  const total = await ISOModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const docs = await ISOModel.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const formatted = docs.map((iso) => ({
    ...iso,
    status: calculateStatus(iso.expiryDate),
    fileUrl: iso.fileKey ? "https://dummy-url.com/presigned-url" : null,
  }));

  return {
    total,
    totalPages,
    docs: formatted,
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

  if (data.isoStandard && !allowedStandards.includes(data.isoStandard)) {
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

  if (existing.fileKey) {
    await deleteFromS3(existing.fileKey);
  }

  await ISOModel.findByIdAndDelete(id);

  return true;
};
