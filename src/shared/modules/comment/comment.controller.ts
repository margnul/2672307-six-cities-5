import { inject, injectable } from 'inversify';
import { Response, Request } from 'express';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { CommentService } from './comment-service.interface.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { fillDTO } from '../../helpers/common.js';
import { CommentRdo } from './rdo/comment.rdo.js';

@injectable()
export default class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
  ) {
    super(logger);

    this.logger.info('Register routes for CommentController…');
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateCommentDto)]
    });
  }

  public async create(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, CreateCommentDto>,
    res: Response
  ): Promise<void> {
    const comment = await this.commentService.create(body);
    this.created(res, fillDTO(CommentRdo, comment));
  }
}
