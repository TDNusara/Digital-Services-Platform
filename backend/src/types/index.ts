import { Request } from 'express';

export type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';

export type OrderStatus =
  | 'PENDING_REVIEW'
  | 'AWAITING_CUSTOMER_INFO'
  | 'QUOTATION_SENT'
  | 'AWAITING_PAYMENT'
  | 'READY_FOR_ASSIGNMENT'
  | 'AWAITING_WORKER_ACCEPTANCE'
  | 'IN_PROGRESS'
  | 'SUBMITTED_FOR_QC'
  | 'READY_FOR_CUSTOMER'
  | 'REVISION_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export type FileTag =
  | 'CUSTOMER_ORIGINAL'
  | 'CUSTOMER_ADDITIONAL'
  | 'WORKER_DRAFT'
  | 'FINAL_DELIVERABLE'
  | 'QC_ANNOTATION';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
