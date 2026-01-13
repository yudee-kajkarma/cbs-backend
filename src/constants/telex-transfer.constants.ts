export enum TelexTransferStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export const allowedTelexTransferStatuses = Object.values(TelexTransferStatus);

export enum AuthorizedPerson {
  CHRISTOPHER = "Christopher",
  JOHN_SMITH = "John Smith",
  SARAH_JOHNSON = "Sarah Johnson",
  MICHAEL_BROWN = "Michael Brown",
}

export const allowedAuthorizedPersons = Object.values(AuthorizedPerson);
