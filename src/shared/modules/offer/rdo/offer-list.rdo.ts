import { Expose } from 'class-transformer';

export class OfferListRdo {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public price!: number;

  @Expose()
  public city!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public rating!: number;
}
