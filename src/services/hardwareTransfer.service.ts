import { HardwareTransferModel } from "../models/hardwareTransfer.model";

export class HardwareTransferService {

  // ⭐ Automatically calculate status
  private calculateStatus(data: any) {
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

  // ⭐ CREATE TRANSFER
  async create(data: any) {
    const status = this.calculateStatus(data);

    return await HardwareTransferModel.create({
      ...data,
      status,
    });
  }

  // ⭐ LIST TRANSFERS
  async list(page: number, limit: number, filters: any) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      HardwareTransferModel.find(filters)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      HardwareTransferModel.countDocuments(filters),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ⭐ GET BY ID
  async getById(id: string) {
    return HardwareTransferModel.findById(id);
  }

  // ⭐ UPDATE TRANSFER (recalculate status)
  async update(id: string, data: any) {
    const status = this.calculateStatus(data);

    return HardwareTransferModel.findByIdAndUpdate(
      id,
      { ...data, status },
      { new: true }
    );
  }

  // ⭐ DELETE TRANSFER
  async delete(id: string) {
    return HardwareTransferModel.findByIdAndDelete(id);
  }
}
