export enum DocumentCategory {
  CONTRACT = 'Contract',
  TEMPLATE = 'Template',
  AGREEMENT = 'Agreement',
  POLICY = 'Policy',
  OTHER = 'Other'
}

export enum DocumentStatus {
  ACTIVE = 'Active',
  ARCHIVED = 'Archived'
}

export const allowedDocumentCategories = Object.values(DocumentCategory);
export const allowedDocumentStatuses = Object.values(DocumentStatus);
