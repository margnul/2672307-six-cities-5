import { defaultClasses, modelOptions, prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';
import { OfferEntity } from '../offer/offer.entity.js';

export interface CommentEntity extends defaultClasses.Base { }

@modelOptions({ schemaOptions: { collection: 'comments', timestamps: true } })
export class CommentEntity {
  @prop({ trim: true, required: true })
  public text!: string;

  @prop({ required: true })
  public rating!: number;

  @prop({ ref: OfferEntity, required: true })
  public offerId!: Ref<OfferEntity>;

  @prop({ ref: UserEntity, required: true })
  public userId!: Ref<UserEntity>;
}

export const CommentModel = getModelForClass(CommentEntity);
