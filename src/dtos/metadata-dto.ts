import { Expose } from 'class-transformer';

export class MetadataResponseDto {
    @Expose({ name: '_id' })
    id!: string;

    @Expose()
    standardWorkStartTime!: string;

    @Expose()
    halfDayHoursThreshold!: number;

    @Expose()
    autoCheckoutTime!: string;

    @Expose()
    isActive!: boolean;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}
