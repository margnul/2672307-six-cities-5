import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/component.enum.js';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { SortType } from '../../types/sort-type.enum.js';

@injectable()
export default class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>
  ) { }

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    return this.offerModel.create(dto as any);
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(offerId).populate(['userId']).exec();
  }

  public async find(count?: number): Promise<DocumentType<OfferEntity>[]> {
    const limit = count ?? 60;
    return this.offerModel
      .find()
      .sort({ createdAt: SortType.Down })
      .limit(limit)
      .populate(['userId'])
      .exec();
  }

  // Метод для удаления
  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findByIdAndDelete(offerId).exec();
  }

  // Метод для обновления (редактирования)
  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, dto as any, { new: true })
      .populate(['userId'])
      .exec();
  }

  // Сценарий 5.12: Премиальные предложения для города
  public async findPremium(city: string): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .sort({ createdAt: SortType.Down })
      .limit(3)
      .populate(['userId'])
      .exec();
  }

  // Сценарий 5.13: Избранные предложения
  public async findFavorites(): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ isFavorite: true })
      .sort({ createdAt: SortType.Down })
      .populate(['userId'])
      .exec();
  }

  // Тот самый метод для автоматического пересчета
  public async updateRatingAndCommentCount(offerId: string, newRating: number): Promise<void> {
    const offer = await this.offerModel.findById(offerId);

    if (!offer) {
      throw new Error('Offer not found');
    }

    const currentRating = offer.rating ?? 0;
    const currentCount = offer.commentCount ?? 0;
    const updatedCount = currentCount + 1;
    const updatedRating = ((currentRating * currentCount) + newRating) / updatedCount;

    await this.offerModel.findByIdAndUpdate(offerId, {
      rating: Number(updatedRating.toFixed(1)),
      commentCount: updatedCount,
    }).exec();
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel.exists({ _id: documentId })) !== null;
  }
}
