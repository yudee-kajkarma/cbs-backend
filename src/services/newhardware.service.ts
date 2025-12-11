import { NewHardwareModel } from "../models/newhardware.model";
import { INewHardware } from "../models/newhardware.model";

export const newHardwareService = {
  async create(data: INewHardware) {
    return await NewHardwareModel.create(data);
  },

  async getAll(page: number, limit: number, filters: any = {}) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // ❗ FIXED: Search only added when search exists
    if (filters.search && filters.search !== "") {
      const re = new RegExp(filters.search as string, "i");
      query.$or = [
        { deviceName: re },
        { serialNumber: re },
        { assignedTo: re }
      ];
    }

    // ❗ FIXED: These should only run if value exists
    if (filters.type) query.type = filters.type;
    if (filters.operatingSystem) query.operatingSystem = filters.operatingSystem;
    if (filters.department) query.department = filters.department;
    if (filters.status) query.status = filters.status;

const sortField = filters.sort || "createdAt";
const sortOrder = filters.order === "asc" ? 1 : -1;

const [items, total] = await Promise.all([
  NewHardwareModel.find(query)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit),

  NewHardwareModel.countDocuments(query),
]);

    return {
      newHardwares: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
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
