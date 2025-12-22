import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';
import { UserRole } from '../constants';

/**
 * Response DTO for User entity
 */
export class UserResponseDto extends BaseDto {
  @Expose()
  userId!: string;

  @Expose()
  fullName!: string;

  @Expose()
  email!: string;

  @Expose()
  username!: string;

  @Expose()
  role!: UserRole;

}

/**
 * Response DTO for paginated user list
 */
export class GetAllUsersResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  users!: UserResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}
