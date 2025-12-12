export enum AuditType {
  FINANCIAL = "Financial Audit",
  INTERNAL = "Internal Audit",
  COMPLIANCE = "Compliance Audit",
  TAX = "Tax Audit",
  OPERATIONAL = "Operational Audit"
}

export const allowedAuditTypes = Object.values(AuditType);
