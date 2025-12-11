import { SimModel, ISim } from "../models/sim.model";
import { FilterQuery } from "mongoose";
import { paginate, validatePaginationParams, parseSortParams } from "../utils/pagination.util";

class SimService {
  // ---------- CREATE ----------
  async createSim(payload: Partial<ISim>): Promise<ISim> {
    const sim = await SimModel.create(payload);
    return sim.toObject();
  }

  // ---------- GET ALL ----------
  async getAllSims(
    filter: FilterQuery<ISim> = {},
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

    const { data: items, pagination } = await paginate(SimModel, filter, {
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

  // ---------- GET ONE ----------
  async getSimById(id: string) {
    return SimModel.findById(id).lean().select("-__v");
  }

  // ---------- UPDATE ----------
  async updateSim(id: string, payload: Partial<ISim>) {
    return SimModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    })
      .lean()
      .select("-__v");
  }

  // ---------- DELETE ----------
  async deleteSim(id: string) {
    return SimModel.findByIdAndDelete(id).lean().select("-__v");
  }
}

export const simService = new SimService();
