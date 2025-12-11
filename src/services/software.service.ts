import { SoftwareModel, ISoftware } from "../models/software.model";
import { FilterQuery, SortOrder } from "mongoose";

class SoftwareService {
  async createSoftware(payload: Partial<ISoftware>): Promise<ISoftware> {
    const doc = await SoftwareModel.create(payload);
    return doc.toObject();
  }

  async getAll(
    filter: FilterQuery<ISoftware> = {},
    page = 1,
    limit = 10,
    sort: Record<string, SortOrder> = { createdAt: -1 }
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      SoftwareModel.find(filter)
        .sort(sort) // ⭐ SORT NOW HAS CORRECT TYPE
        .skip(skip)
        .limit(limit)
        .lean()
        .select("-__v"),

      SoftwareModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      software: items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getById(id: string) {
    return SoftwareModel.findById(id).lean().select("-__v");
  }

  async updateSoftware(id: string, payload: Partial<ISoftware>) {
    return SoftwareModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .lean()
      .select("-__v");
  }

  async deleteSoftware(id: string) {
    return SoftwareModel.findByIdAndDelete(id).lean().select("-__v");
  }

  async findByLicenseKey(key: string) {
    return SoftwareModel.findOne({ licenseKey: key })
      .lean()
      .select("-__v");
  }
}

export const softwareService = new SoftwareService();
