import Joi, { ObjectSchema } from "joi";
import { VehicleType, FuelType, VehicleStatus, VehicleDepartment } from "../constants/vehicle.constants";
import { Currency } from "../constants/common.constants";

// CREATE
export const createVehicleSchema: ObjectSchema = Joi.object({
  vehicleName: Joi.string().max(200).required(),
  makeBrand: Joi.string().max(100).required(),
  vehicleModel: Joi.string().max(100).optional().allow(""),
  vehicleType: Joi.string().valid(...Object.values(VehicleType)).required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  color: Joi.string().max(50).optional().allow(""),
  fuelType: Joi.string().valid(...Object.values(FuelType)).required(),
  chassisNumber: Joi.string().max(50).required(),
  engineNumber: Joi.string().max(50).optional().allow(""),
  plateNumber: Joi.string().max(50).required(),
  registrationExpiry: Joi.date().iso().optional().allow(null),
  insuranceProvider: Joi.string().max(100).optional().allow(""),
  insuranceExpiry: Joi.date().iso().optional().allow(null),
  purchaseDate: Joi.date().iso().optional().allow(null),
  purchaseValue: Joi.number().min(0).optional().allow(null),
  purchaseCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  currentValue: Joi.number().min(0).optional().allow(null),
  currentCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  assignedTo: Joi.string().max(100).optional().allow("", "Unassigned"),
  department: Joi.string().valid(...Object.values(VehicleDepartment)).optional(),
  mileage: Joi.number().min(0).optional().allow(null),
  lastService: Joi.date().iso().optional().allow(null),
  nextService: Joi.date().iso().optional().allow(null),
  status: Joi.string().valid(...Object.values(VehicleStatus)).default("Active"),
  notes: Joi.string().max(1000).optional().allow(""),
});

// UPDATE - all optional
export const updateVehicleSchema: ObjectSchema = Joi.object({
  vehicleName: Joi.string().max(200).optional(),
  makeBrand: Joi.string().max(100).optional(),
  vehicleModel: Joi.string().max(100).optional().allow(""),
  vehicleType: Joi.string().valid(...Object.values(VehicleType)).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: Joi.string().max(50).optional().allow(""),
  fuelType: Joi.string().valid(...Object.values(FuelType)).optional(),
  chassisNumber: Joi.string().max(50).optional(),
  engineNumber: Joi.string().max(50).optional().allow(""),
  plateNumber: Joi.string().max(50).optional(),
  registrationExpiry: Joi.date().iso().optional().allow(null),
  insuranceProvider: Joi.string().max(100).optional().allow(""),
  insuranceExpiry: Joi.date().iso().optional().allow(null),
  purchaseDate: Joi.date().iso().optional().allow(null),
  purchaseValue: Joi.number().min(0).optional().allow(null),
  purchaseCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  currentValue: Joi.number().min(0).optional().allow(null),
  currentCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  assignedTo: Joi.string().max(100).optional().allow("", "Unassigned"),
  department: Joi.string().valid(...Object.values(VehicleDepartment)).optional(),
  mileage: Joi.number().min(0).optional().allow(null),
  lastService: Joi.date().iso().optional().allow(null),
  nextService: Joi.date().iso().optional().allow(null),
  status: Joi.string().valid(...Object.values(VehicleStatus)).optional(),
  notes: Joi.string().max(1000).optional().allow(""),
}).min(1);

// LIST QUERY
export const getVehicleListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(10),
  search: Joi.string().optional().allow(""),
  vehicleType: Joi.string().valid(...Object.values(VehicleType)).optional(),
  fuelType: Joi.string().valid(...Object.values(FuelType)).optional(),
  status: Joi.string().valid(...Object.values(VehicleStatus)).optional(),
  department: Joi.string().valid(...Object.values(VehicleDepartment)).optional(),
  assignedTo: Joi.string().optional().allow(""),
  
  orderBy: Joi.string()
    .valid(
      "vehicleName",
      "makeBrand",
      "vehicleModel",
      "vehicleType",
      "year",
      "plateNumber",
      "status",
      "department",
      "mileage",
      "purchaseDate",
      "registrationExpiry",
      "insuranceExpiry",
      "lastService",
      "nextService",
      "createdAt",
      "updatedAt"
    )
    .default("createdAt"),

  sortBy: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});

// GET BY ID
export const getVehicleByIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).required(),
});
