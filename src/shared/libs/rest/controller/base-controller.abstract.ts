import { injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Controller } from './controller.interface.js';
import { Logger } from '../../logger/logger.interface.js';
import { Route } from '../types/route.interface.js';

@injectable()
export abstract class BaseController implements Controller {
  private readonly _router: Router;

  constructor(
    protected readonly logger: Logger
  ) {
    this._router = Router();
  }

  get router() {
    return this._router;
  }

  public addRoute(route: Route) {
    const wrapperAsyncHandler = asyncHandler(route.handler.bind(this));

    const middlewareHandlers = route.middlewares?.map(
      (item) => asyncHandler(item.execute.bind(item))
    ) || [];

    this._router[route.method](route.path, [...middlewareHandlers, wrapperAsyncHandler]);
    this.logger.info(`Route registered: ${route.method.toUpperCase()} ${route.path}`);
  }

  public send<T>(res: Response, statusCode: number, data: T): void {
    res
      .type('application/json')
      .status(statusCode)
      .json(data);
  }

  public created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  public ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  public noContent<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.NO_CONTENT, data);
  }
}
