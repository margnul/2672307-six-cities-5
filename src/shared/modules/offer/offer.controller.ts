import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { OfferService } from './offer-service.interface.js';
import { UserService } from '../user/user-service.interface.js';
import { fillDTO } from '../../helpers/common.js';
import { OfferListRdo } from './rdo/offer-list.rdo.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../libs/rest/middleware/validate-objectid.middleware.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { DocumentExistsMiddleware } from '../../libs/rest/middleware/document-exists.middleware.js';
import { PrivateRouteMiddleware } from '../../libs/rest/middleware/private-route.middleware.js';

@injectable()
export default class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController…');

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index
    });

    this.addRoute({
      path: '/premium',
      method: HttpMethod.Get,
      handler: this.getPremium
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });

    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });

    this.addRoute({
      path: '/:offerId/favorite/:status',
      method: HttpMethod.Post,
      handler: this.updateFavoriteStatus,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });
  }

  public async index({ tokenPayload }: Request, res: Response): Promise<void> {
    const offers = await this.offerService.find(tokenPayload?.id);
    this.ok(res, fillDTO(OfferListRdo, offers));
  }

  public async create(
    { body, tokenPayload }: Request<Record<string, unknown>, Record<string, unknown>, CreateOfferDto>,
    res: Response
  ): Promise<void> {
    const result = await this.offerService.create({ ...body, userId: tokenPayload!.id });
    this.created(res, fillDTO(OfferListRdo, result));
  }

  public async getPremium({ query }: Request, res: Response): Promise<void> {
    const offers = await this.offerService.findPremium(query.city as string);
    this.ok(res, fillDTO(OfferListRdo, offers));
  }

  public async show({ params }: Request, res: Response): Promise<void> {
    const { offerId } = params;
    const offer = await this.offerService.findById(offerId as string);
    this.ok(res, fillDTO(OfferListRdo, offer));
  }

  public async delete({ params, tokenPayload }: Request, res: Response): Promise<void> {
    const { offerId } = params;
    const offer = await this.offerService.findById(offerId as string);

    if (offer?.userId?.toString() !== tokenPayload?.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to delete this offer.',
        'OfferController'
      );
    }

    await this.offerService.deleteById(offerId as string);
    this.noContent(res, null);
  }

  public async updateFavoriteStatus({ params, tokenPayload }: Request, res: Response): Promise<void> {
    const { offerId, status } = params;
    const isFavorite = parseInt(status as string, 10) === 1;

    await this.userService.updateFavorite(tokenPayload!.id, offerId as string, isFavorite);

    const offer = await this.offerService.findById(offerId as string);
    this.ok(res, fillDTO(OfferListRdo, offer));
  }
}
