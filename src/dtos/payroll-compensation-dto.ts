import { Expose } from 'class-transformer';

export class PayrollCompensationResponseDto {
 @Expose({ name: '_id' })
    id!: string;

  @Expose()
  socialInsuranceRate!: number;

  @Expose()
  payrollProcessingDay!: number;

  @Expose()
  currency!: string;

  @Expose()
  paymentMethod!: string;

  @Expose()
  attendanceBonusAmount!: number;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
