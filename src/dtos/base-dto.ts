import { Expose, Exclude, Transform } from 'class-transformer';

export class BaseDto {
  @Expose({ name: 'id' })
  @Transform(({ obj }) => obj._id?.toString())
  id!: string;

  @Exclude()
  __v!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
