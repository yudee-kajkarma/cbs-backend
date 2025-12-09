import { NetworkEquipmentModel, INetworkEquipment } from "../models/network-equipment.model";
import { FilterQuery } from "mongoose";

class NetworkEquipmentService {

  async create(payload: Partial<INetworkEquipment>): Promise<INetworkEquipment> {
    const doc = await NetworkEquipmentModel.create(payload);
    return doc.toObject({ versionKey: false });
  }

  async getAll(filter: FilterQuery<INetworkEquipment> = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      NetworkEquipmentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .select("-__v"),
      NetworkEquipmentModel.countDocuments(filter)
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
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
