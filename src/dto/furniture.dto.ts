import Joi, { ObjectSchema } from "joi";

const categoryEnum = [
  "Office Furniture",
  "Meeting Room Furniture",
  "Storage Furniture",
  "Lounge Furniture",
  "Reception Furniture",
  "Outdoor Furniture",
];

const conditionEnum = ["Excellent", "Good", "Fair", "Poor"];
const currencyEnum = ["KWD", "USD", "EUR", "GBP"];
const statusEnum = ["Active", "Under Repair", "Inactive", "Disposed"];

// CREATE
export const createFurnitureSchema: ObjectSchema = Joi.object({
  itemName: Joi.string().required(),
  itemCode: Joi.string().required(),
  category: Joi.string().valid(...categoryEnum).required(),
  quantity: Joi.number().integer().min(0).required(),
  condition: Joi.string().valid(...conditionEnum).optional(),
  material: Joi.string().optional().allow(""),
  color: Joi.string().optional().allow(""),
  dimensions: Joi.string().optional().allow(""),
  location: Joi.string().required(),
  assignedTo: Joi.string().optional().allow("Unassigned", ""),
  supplier: Joi.string().optional().allow(""),
  purchaseDate: Joi.date().iso().optional().allow(null),
  unitValue: Joi.number().precision(2).optional().allow(null),
  purchaseCurrency: Joi.string().valid(...currencyEnum).optional(),
  currentUnitValue: Joi.number().precision(2).optional().allow(null),
  currentCurrency: Joi.string().valid(...currencyEnum).optional(),
  warrantyExpiry: Joi.date().iso().optional().allow(null),
  lastInspection: Joi.date().iso().optional().allow(null),
  status: Joi.string().valid(...statusEnum).default("Active"),
  notes: Joi.string().optional().allow(""),
});

// UPDATE - all optional
export const updateFurnitureSchema: ObjectSchema = Joi.object({
  itemName: Joi.string().optional(),
  itemCode: Joi.string().optional(),
  category: Joi.string().valid(...categoryEnum).optional(),
  quantity: Joi.number().integer().min(0).optional(),
  condition: Joi.string().valid(...conditionEnum).optional(),
  material: Joi.string().optional().allow(""),
  color: Joi.string().optional().allow(""),
  dimensions: Joi.string().optional().allow(""),
  location: Joi.string().optional(),
  assignedTo: Joi.string().optional().allow("Unassigned", ""),
  supplier: Joi.string().optional().allow(""),
  purchaseDate: Joi.date().iso().optional().allow(null),
  unitValue: Joi.number().precision(2).optional().allow(null),
  purchaseCurrency: Joi.string().valid(...currencyEnum).optional(),
  currentUnitValue: Joi.number().precision(2).optional().allow(null),
  currentCurrency: Joi.string().valid(...currencyEnum).optional(),
  warrantyExpiry: Joi.date().iso().optional().allow(null),
  lastInspection: Joi.date().iso().optional().allow(null),
  status: Joi.string().valid(...statusEnum).optional(),
  notes: Joi.string().optional().allow(""),
});

// LIST QUERY
export const getFurnitureListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(10),
  search: Joi.string().optional().allow(""),
  category: Joi.string().valid(...categoryEnum).optional(),
  status: Joi.string().valid(...statusEnum).optional(),
  location: Joi.string().optional().allow(""),
  
  orderBy: Joi.string()
    .valid(
      "itemName",
      "itemCode",
      "category",
      "quantity",
      "condition",
      "location",
      "status",
      "purchaseDate",
      "warrantyExpiry",
      "lastInspection",
      "createdAt",
      "updatedAt"
    )
    .default("createdAt"),

  sortBy: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});

// GET BY ID
export const getFurnitureByIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).required(),
});
