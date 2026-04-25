import { inject, injectable } from 'inversify';
import { Response, Request } from 'express';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserService } from './user-service.interface.js';
import { fillDTO } from '../../helpers/common.js';
import { UserRdo } from './rdo/user.rdo.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';

@injectable()
export default class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    super(logger);

    this.logger.info('Register routes for UserController…');

    this.addRoute({ path: '/register', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/login', method: HttpMethod.Post, handler: this.login });
    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)] // <-- Подключили валидацию
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)] // <-- Подключили валидацию
    });
  }

  public async create(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>,
    res: Response,
  ): Promise<void> {
    const result = await this.userService.create(body, 'salt_example'); // Соль пока заглушка
    this.created(res, fillDTO(UserRdo, result));
  }

  public async login(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, LoginUserDto>,
    _res: Response,
  ): Promise<void> {
    // Логика проверки будет в 7 разделе, пока просто логируем
    this.logger.info(`User try login: ${body.email}`);
    throw new Error('Not implemented');
  }
}
