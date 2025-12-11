import { HardwareTransferModel, IHardwareTransfer } from "../models/hardwareTransfer.model";
import { paginate, validatePaginationParams, parseSortParams } from "../utils/pagination.util";
import { FilterQuery } from "mongoose";

export class HardwareTransferService {

  // Calculate status with proper interface
  private calculateStatus(data: Partial<IHardwareTransfer>): string {
    const today = new Date();

    // Permanent transfer always => Permanent
    if (data.transferType === "Permanent") {
      return "Permanent";
    }

    // Temporary transfer
    if (data.transferType === "Temporary") {
      if (data.expectedReturnDate) {
        const expectedDate = new Date(data.expectedReturnDate);
        return today >= expectedDate ? "Returned" : "Active";
      }
      return "Active"; // If no expected return date
    }

    return "Active"; // default
  }

  // CREATE TRANSFER
  async create(data: Partial<IHardwareTransfer>) {
    const status = this.calculateStatus(data);

    const doc = await HardwareTransferModel.create({
      ...data,
      status,
    });

    return doc.toObject();
  }

  // LIST TRANSFERS with search, filters, and sorting
  async list(
    page: number,
    limit: number,
    filters: any,
    orderBy?: string,
    sortBy?: string
  ) {
    // Validate pagination
    const validation = validatePaginationParams(page, limit);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const query: FilterQuery<IHardwareTransfer> = {};

    // Search across multiple fields
    if (filters.search) {
      query.$or = [
        { serialNumber: { $regex: filters.search, $options: "i" } },
        { hardwareName: { $regex: filters.search, $options: "i" } },
        { transferReason: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Field filters
    if (filters.hardwareName) query.hardwareName = filters.hardwareName;
    if (filters.fromUser) query.fromUser = filters.fromUser;
    if (filters.toUser) query.toUser = filters.toUser;
    if (filters.transferType) query.transferType = filters.transferType;
    if (filters.hardwareCondition) query.hardwareCondition = filters.hardwareCondition;
    if (filters.status) query.status = filters.status;

    // Date range filters
    if (filters.transferDateFrom || filters.transferDateTo) {
      query.transferDate = {};
      if (filters.transferDateFrom) query.transferDate.$gte = new Date(filters.transferDateFrom);
      if (filters.transferDateTo) query.transferDate.$lte = new Date(filters.transferDateTo);
    }

    if (filters.expectedReturnDateFrom || filters.expectedReturnDateTo) {
      query.expectedReturnDate = {};
      if (filters.expectedReturnDateFrom) query.expectedReturnDate.$gte = new Date(filters.expectedReturnDateFrom);
      if (filters.expectedReturnDateTo) query.expectedReturnDate.$lte = new Date(filters.expectedReturnDateTo);
    }

    // Parse sorting
    const sort = orderBy && sortBy
      ? parseSortParams(orderBy, sortBy)
      : { createdAt: -1 as const };

    const { data: items, pagination } = await paginate(HardwareTransferModel, query, {
      page,
      limit,
      sort,
      lean: true,
    });

    return {
      items,
      pagination,
    };
  }

  // GET BY ID
  async getById(id: string) {
    return HardwareTransferModel.findById(id).lean();
  }

  // UPDATE TRANSFER (recalculate status)
  async update(id: string, data: Partial<IHardwareTransfer>) {
    const status = this.calculateStatus(data);

    return HardwareTransferModel.findByIdAndUpdate(
      id,
      { ...data, status },
      { new: true, runValidators: true, lean: true }
    );
  }

  // DELETE TRANSFER
  async delete(id: string) {
    return HardwareTransferModel.findByIdAndDelete(id).lean();
  }
}
