import { Types } from 'mongoose';
import { BaseQuery } from './model.interface';

export interface RoleBaseFields {
  name: string;
  description?: string;
  permissions: Record<string, Record<string, number>>;
}

export interface CreateDefaultRolesRequest {
  createdBy?: Types.ObjectId | null;
}

export interface CreateRoleRequest extends RoleBaseFields {
  createdBy?: Types.ObjectId;
}

export interface UpdateRoleRequest extends Partial<RoleBaseFields> {
  isActive?: boolean;
}

export interface RoleQueryParams extends BaseQuery {
  isSystemRole?: boolean;
  isActive?: boolean;
  createdBy?: Types.ObjectId;
}

export interface RoleWithPermissions extends RoleBaseFields {
  _id: Types.ObjectId;
  isSystemRole: boolean;
  isActive: boolean;
  createdBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRole extends RoleBaseFields {
  createdBy?: Types.ObjectId | null;
  isSystemRole: boolean;
}

