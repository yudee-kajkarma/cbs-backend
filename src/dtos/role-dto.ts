import { Expose, Type } from "class-transformer";
import { BaseDto } from "./base-dto";
import { PaginationResult } from "../interfaces/pagination.interface";

/**
 * Response DTO for Role entity
 */
export class RoleResponseDto extends BaseDto {
  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose()
  permissions!: Record<string, Record<string, number>>;

  @Expose()
  isSystemRole!: boolean;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdBy?: string;
}

/**
 * Response DTO for paginated role list
 */
export class GetAllRolesResponseDto {
  @Expose()
  @Type(() => RoleResponseDto)
  roles!: RoleResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>["pagination"];

  @Expose()
  filters!: PaginationResult<any>["filters"];
}

/**
 * Response DTO for default roles creation
 * Note: ADMIN and HR roles get full access via middleware, only READ_ONLY role is created
 */
export class DefaultRolesResponseDto {
  @Expose()
  @Type(() => RoleResponseDto)
  readOnlyRole!: RoleResponseDto;
}
