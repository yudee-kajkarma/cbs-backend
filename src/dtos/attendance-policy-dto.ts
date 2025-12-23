import { Expose } from 'class-transformer';

export class AttendancePolicyResponseDto {
    @Expose({ name: '_id' })
    id!: string;

    @Expose()
    standardHoursPerDay!: number;

    @Expose()
    workingDaysPerWeek!: number;

    @Expose()
    overtimeRateMultiplier!: number;

    @Expose()
    lateArrivalGracePeriod!: number;

    @Expose()
    attendanceBonusThreshold!: number;

    @Expose()
    hoursConcessionPercentage!: number;

    @Expose()
    shortfallDeductionPercentage!: number;

    @Expose()
    isActive!: boolean;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}
