import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { OfferService } from './offer-service.interface.js';
import { fillDTO } from '../../helpers/common.js';
import { OfferListRdo } from './rdo/offer-list.rdo.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../libs/rest/middleware/validate-objectid.middleware.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

@injectable()
export default class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController…');

    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateOfferDto)]
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [new ValidateObjectIdMiddleware('offerId')]
    });
    this.addRoute({ path: '/premium', method: HttpMethod.Get, handler: this.getPremium });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [new ValidateObjectIdMiddleware('offerId')]
    });
  }

  public async index(_req: Request, res: Response): Promise<void> {
    const offers = await this.offerService.find();
    this.ok(res, fillDTO(OfferListRdo, offers));
  }

  public async create(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, CreateOfferDto>,
    res: Response
  ): Promise<void> {
    const result = await this.offerService.create(body);
    this.created(res, fillDTO(OfferListRdo, result));
  }

  public async getPremium({ query }: Request, res: Response): Promise<void> {
    const offers = await this.offerService.findPremium(query.city as string);
    this.ok(res, fillDTO(OfferListRdo, offers));
  }

  public async show({ params }: Request, res: Response): Promise<void> {
    const offerId = params.offerId as string;
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(
        404,
        `Offer with id ${offerId} not found.`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferListRdo, offer));
  }

  public async delete({ params }: Request, res: Response): Promise<void> {
    const { offerId } = params;
    const offer = await this.offerService.deleteById(offerId as string);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController'
      );
    }

    this.noContent(res, null);
  }
}
