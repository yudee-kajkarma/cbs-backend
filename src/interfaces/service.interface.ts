/**
 * ISO Service Interfaces
 */
export interface CreateISOInput {
  certificateName: string;
  isoStandard: string;
  issueDate: Date;
  expiryDate: Date;
  certifyingBody: string;
}

export interface UpdateISOInput {
  certificateName?: string;
  isoStandard?: string;
  issueDate?: Date;
  expiryDate?: Date;
  certifyingBody?: string;
}
