import { NewHardwareModel } from "../models/newhardware.model";
import { INewHardware } from "../models/newhardware.model";
import { paginate, parseSortParams } from "../utils/pagination.util";

export const newHardwareService = {
  async create(data: INewHardware) {
    return await NewHardwareModel.create(data);
  },

  async getAll(page: number, limit: number, filters: any = {}) {
    const query: any = {};

    // Search only added when search exists
    if (filters.search && filters.search !== "") {
      const re = new RegExp(filters.search as string, "i");
      query.$or = [
        { deviceName: re },
        { serialNumber: re },
        { assignedTo: re }
      ];
    }

    // These should only run if value exists
    if (filters.type) query.type = filters.type;
    if (filters.operatingSystem) query.operatingSystem = filters.operatingSystem;
    if (filters.department) query.department = filters.department;
    if (filters.status) query.status = filters.status;

    // Use pagination utility with sorting
    const sortQuery = parseSortParams(filters.orderBy || 'createdAt', filters.sortBy || 'desc');
    const { data: items, pagination } = await paginate(NewHardwareModel, query, {
      page,
      limit,
      sort: sortQuery,
      lean: false,
    });

    return {
      items,
      pagination,
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
