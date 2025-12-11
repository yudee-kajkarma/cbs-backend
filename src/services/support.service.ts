import { SupportModel } from "../models/support.model";
import { ISupport } from "../models/support.model";
import { FilterQuery } from "mongoose";
import { paginate, parseSortParams } from "../utils/pagination.util";

interface IGetAllSupportParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  priority?: string;
  department?: string;
  status?: string;
  orderBy?: string;
  sortBy?: "asc" | "desc";
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
      orderBy = "createdAt",
      sortBy = "desc",
    } = params;

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

    // Use pagination utility with sorting
    const sortQuery = parseSortParams(orderBy, sortBy);
    const { data: items, pagination: paginationMeta } = await paginate(SupportModel, query, {
      page,
      limit,
      sort: sortQuery,
      lean: false,
    });

    return {
      items,
      pagination: paginationMeta,
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
