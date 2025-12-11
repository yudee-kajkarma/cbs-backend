import { SoftwareModel, ISoftware } from "../models/software.model";
import { FilterQuery } from "mongoose";
import { paginate, parseSortParams, validatePaginationParams } from "../utils/pagination.util";

class SoftwareService {
  async createSoftware(payload: Partial<ISoftware>): Promise<ISoftware> {
    const doc = await SoftwareModel.create(payload);
    return doc.toObject();
  }

  async getAll(
    filter: FilterQuery<ISoftware> = {},
    page = 1,
    limit = 10,
    orderBy?: string,
    sortBy?: string
  ) {
    // Validate pagination parameters
    const validation = validatePaginationParams(page, limit);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Parse sorting
    const sort = orderBy && sortBy
      ? parseSortParams(orderBy, sortBy)
      : { createdAt: -1 as const };

    const { data: items, pagination } = await paginate(SoftwareModel, filter, {
      page,
      limit,
      sort,
      select: "-__v",
    });

    return {
      items,
      pagination,
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
}

export const softwareService = new SoftwareService();
