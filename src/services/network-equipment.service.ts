import { NetworkEquipmentModel, INetworkEquipment } from "../models/network-equipment.model";
import { FilterQuery } from "mongoose";
import { paginate, parseSortParams, validatePaginationParams } from "../utils/pagination.util";

class NetworkEquipmentService {

  async create(payload: Partial<INetworkEquipment>): Promise<INetworkEquipment> {
    const doc = await NetworkEquipmentModel.create(payload);
    return doc.toObject();
  }

  async getAll(
    filter: FilterQuery<INetworkEquipment> = {},
    page = 1,
    limit = 10,
    orderBy?: string,
    sortBy?: string
  ) {
    // Validate pagination
    const validation = validatePaginationParams(page, limit);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Parse sorting
    const sort = orderBy && sortBy
      ? parseSortParams(orderBy, sortBy)
      : { createdAt: -1 as const };

    const { data: networkEquipments, pagination } = await paginate(NetworkEquipmentModel, filter, {
      page,
      limit,
      sort,
      select: "-__v",
    });

    return {
      networkEquipments,
      pagination,
    };
  }


  async getById(id: string) {
    return NetworkEquipmentModel.findById(id).lean().select("-__v");
  }

  async update(id: string, payload: Partial<INetworkEquipment>) {
    return NetworkEquipmentModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    })
      .lean()
      .select("-__v");
  }

  async delete(id: string) {
    return NetworkEquipmentModel.findByIdAndDelete(id).lean().select("-__v");
  }

  async findBySerial(serial: string) {
    return NetworkEquipmentModel.findOne({ serialNumber: serial }).lean().select("-__v");
  }

  async findByMac(mac: string) {
    return NetworkEquipmentModel.findOne({ macAddress: mac })
      .lean()
      .select("-__v");
  }

  async findByMacExcludeId(mac: string, id: string) {
    return NetworkEquipmentModel.findOne({
      macAddress: mac,
      _id: { $ne: id }
    })
      .lean()
      .select("-__v");
  }

  async findBySerialExcludeId(serial: string, id: string) {
    return NetworkEquipmentModel.findOne({
      serialNumber: serial,
      _id: { $ne: id }
    })
      .lean()
      .select("-__v");
  }
}

export const networkEquipmentService = new NetworkEquipmentService();
