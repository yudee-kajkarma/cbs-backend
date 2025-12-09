import { SupportModel } from "../models/support.model";
import { ISupport } from "../models/support.model";
import { FilterQuery, SortOrder } from "mongoose";

interface IGetAllSupportParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  priority?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const supportService = {
  async create(data: ISupport) {
    return await SupportModel.create(data);
  },

  async getAll(params: IGetAllSupportParams) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      priority,
      department,
      status,
      sortBy = "createdAt",
      order = "desc",
    } = params;

    const skip = (page - 1) * limit;
    const query: FilterQuery<ISupport> = {};

    // Search by ticketTitle or description
    if (search) {
      query.$or = [
        { ticketTitle: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Sorting
    const sort: { [key: string]: SortOrder } = {};
    if (sortBy) {
      sort[sortBy] = order === "asc" ? 1 : -1;
    }

    const [items, total] = await Promise.all([
      SupportModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      SupportModel.countDocuments(query),
    ]);

    return {
      supports: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
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
