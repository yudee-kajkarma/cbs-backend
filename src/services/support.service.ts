import { SupportModel } from "../models/support.model";
import { ISupport } from "../models/support.model";

export const supportService = {
  async create(data: ISupport) {
    return await SupportModel.create(data);
  },

  async getAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      SupportModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SupportModel.countDocuments(),
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
    return await SupportModel.findById(id);
  },

  async update(id: string, data: Partial<ISupport>) {
    return await SupportModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string) {
    return await SupportModel.findByIdAndDelete(id);
  },
};
