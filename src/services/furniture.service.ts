import { FurnitureModel } from "../models/furniture.model";
import { IFurniture } from "../models/furniture.model";
import { FilterQuery } from "mongoose";
import { paginate, parseSortParams } from "../utils/pagination.util";

export const furnitureService = {
  async create(data: Partial<IFurniture>) {
    return await FurnitureModel.create(data);
  },

  async getAll(page = 1, limit = 10, filters: FilterQuery<IFurniture> = {}, orderBy = "createdAt", sortBy: "asc" | "desc" = "desc") {
    const sortQuery = parseSortParams(orderBy, sortBy);
    const { data: furnitures, pagination } = await paginate(FurnitureModel, filters, {
      page,
      limit,
      sort: sortQuery,
      lean: false,
    });
    
    return {
      furnitures,
      pagination,
    };
  },

  async getById(id: string) {
    return await FurnitureModel.findById(id);
  },

  async update(id: string, data: Partial<IFurniture>) {
    return await FurnitureModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string) {
    return await FurnitureModel.findByIdAndDelete(id);
  },
};
