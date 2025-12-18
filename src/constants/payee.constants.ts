export enum PayeeCategory {
    VENDOR = "Vendor",
    SUPPLIER = "Supplier",
    CONTRACTOR = "Contractor",
    EMPLOYEE = "Employee",
    SERVICE_PROVIDER = "Service Provider",
    OTHER = "Other"
}

export const allowedPayeeCategories = Object.values(PayeeCategory);
