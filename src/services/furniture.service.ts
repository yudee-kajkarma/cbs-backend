import { FurnitureModel } from "../models/furniture.model";
import { IFurniture } from "../models/furniture.model";
import { FilterQuery } from "mongoose";

export const furnitureService = {
  async create(data: Partial<IFurniture>) {
    return await FurnitureModel.create(data);
  },

  async getAll(page = 1, limit = 10, filters: FilterQuery<IFurniture> = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      FurnitureModel.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FurnitureModel.countDocuments(filters),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
