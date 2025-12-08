import { NewHardwareModel } from "../models/newhardware.model";
import { INewHardware } from "../models/newhardware.model";

export const newHardwareService = {
  async create(data: INewHardware) {
    return await NewHardwareModel.create(data);
  },

  async getAll(page: number, limit: number, filters: any = {}) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // basic search across deviceName, serialNumber, assignedTo
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ deviceName: re }, { serialNumber: re }, { assignedTo: re }];
    }

    if (filters.type) query.type = filters.type;
    if (filters.operatingSystem) query.operatingSystem = filters.operatingSystem;
    if (filters.department) query.department = filters.department;
    if (filters.status) query.status = filters.status;

    const [items, total] = await Promise.all([
      NewHardwareModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      NewHardwareModel.countDocuments(query),
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
    return await NewHardwareModel.findById(id);
  },

  async update(id: string, data: Partial<INewHardware>) {
    return await NewHardwareModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string) {
    return await NewHardwareModel.findByIdAndDelete(id);
  },
};
