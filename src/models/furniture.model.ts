import { Schema, model, Document } from "mongoose";

export type FurnitureCategory =
  | "Office Furniture"
  | "Meeting Room Furniture"
  | "Storage Furniture"
  | "Lounge Furniture"
  | "Reception Furniture"
  | "Outdoor Furniture";

export type FurnitureCondition = "Excellent" | "Good" | "Fair" | "Poor";
export type Currency = "KWD" | "USD" | "EUR" | "GBP";
export type FurnitureStatus = "Active" | "Under Repair" | "Inactive" | "Disposed";

export interface IFurniture extends Document {
  itemName: string;
  itemCode: string;
  category: FurnitureCategory;
  quantity: number;
  condition?: FurnitureCondition;
  material?: string;
  color?: string;
  dimensions?: string;
  location: string;
  assignedTo?: string;
  supplier?: string;
  purchaseDate?: Date | null;
  unitValue?: number | null;
  purchaseCurrency?: Currency;
  currentUnitValue?: number | null;
  currentCurrency?: Currency;
  warrantyExpiry?: Date | null;
  lastInspection?: Date | null;
  status: FurnitureStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const parseDDMMYYYY = (value: any) => {
  if (!value || typeof value !== "string") return value;
  const [dd, mm, yyyy] = value.split("-");
  if (!dd || !mm || !yyyy) return value;
  return new Date(`${yyyy}-${mm}-${dd}`);
};

const toDDMMYYYY = (date: any) => {
  if (!date) return null;
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const FurnitureSchema = new Schema<IFurniture>(
  {
    itemName: { type: String, required: true },
    itemCode: { type: String, required: true, unique: true, sparse: true },
    category: {
      type: String,
      enum: [
        "Office Furniture",
        "Meeting Room Furniture",
        "Storage Furniture",
        "Lounge Furniture",
        "Reception Furniture",
        "Outdoor Furniture",
      ],
      required: true,
    },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    condition: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor"],
      default: "Good",
    },
    material: { type: String },
    color: { type: String },
    dimensions: { type: String },

    location: { type: String, required: true },
    assignedTo: { type: String, default: "Unassigned" },

    supplier: { type: String },
    purchaseDate: { type: Date, default: null, set: parseDDMMYYYY },
    unitValue: { type: Number, default: null },
    purchaseCurrency: {
      type: String,
      enum: ["KWD", "USD", "EUR", "GBP"],
      default: "USD",
    },
    currentUnitValue: { type: Number, default: null },
    currentCurrency: {
      type: String,
      enum: ["KWD", "USD", "EUR", "GBP"],
      default: "USD",
    },

    warrantyExpiry: { type: Date, default: null, set: parseDDMMYYYY },
    lastInspection: { type: Date, default: null, set: parseDDMMYYYY },

    status: {
      type: String,
      enum: ["Active", "Under Repair", "Inactive", "Disposed"],
      default: "Active",
      required: true,
    },

    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.purchaseDate = toDDMMYYYY(ret.purchaseDate);
        ret.warrantyExpiry = toDDMMYYYY(ret.warrantyExpiry);
        ret.lastInspection = toDDMMYYYY(ret.lastInspection);
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const FurnitureModel = model<IFurniture>("Furniture", FurnitureSchema);
