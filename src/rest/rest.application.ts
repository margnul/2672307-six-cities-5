import { injectable, inject } from 'inversify';
import express, { Express } from 'express';
import { Logger } from '../shared/libs/logger/logger.interface.js';
import { Config } from '../shared/libs/config/config.interface.js';
import { RestSchema } from '../shared/libs/config/rest.schema.js';
import { Component } from '../shared/types/component.enum.js';
import { DatabaseClient } from '../shared/libs/database-client/database-client.interface.js';
import { getMongoURI } from '../shared/helpers/database.js';
import { Controller } from '../shared/libs/rest/controller/controller.interface.js';
import { ExceptionFilter } from '../shared/libs/rest/exception-filter/exception-filter.interface.js';
import { ParseTokenMiddleware } from '../shared/libs/rest/middleware/parse-token.middleware.js';

@injectable()
export class RestApplication {
  private readonly server: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.OfferController) private readonly offerController: Controller,
    @inject(Component.CommentController) private readonly commentController: Controller,
    @inject(Component.ExceptionFilter) private readonly exceptionFilter: ExceptionFilter,
  ) {
    this.server = express();
  }

  private async _initDb() {
    this.logger.info('Init database...');
    const mongoUri = getMongoURI(
      String(this.config.get('MONGO_INITDB_ROOT_USERNAME')),
      String(this.config.get('MONGO_INITDB_ROOT_PASSWORD')),
      String(this.config.get('DB_IP')),
      27017,
      String(this.config.get('DB_NAME')),
    );

    await this.databaseClient.connect(mongoUri);
    this.logger.info('Init database done');
  }

  private async _initServer() {
    this.logger.info('Try to init server...');
    const port = this.config.get('PORT');
    this.server.listen(port);
    this.logger.info(`🚀 Server started on http://localhost:${port}`);
  }

  private async _initMiddleware() {
    this.logger.info('Global middleware initialization…');
    this.server.use(express.json());
    this.server.use(
      '/upload',
      express.static(this.config.get('UPLOAD_DIRECTORY'))
    );

    const authenticateMiddleware = new ParseTokenMiddleware(this.config.get('JWT_SECRET'));
    this.server.use(authenticateMiddleware.execute.bind(authenticateMiddleware));

    this.logger.info('Global middleware initialization completed');
  }

  private async _initRoutes() {
    this.logger.info('Initializing routes...');
    this.server.use('/offers', this.offerController.router);
    this.server.use('/comments', this.commentController.router);
  }

  private async _initExceptionFilters() {
    this.logger.info('Initializing exception filters...');
    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }

  public async init() {
    this.logger.info('Application initialization...');

    await this._initDb();
    await this._initMiddleware();
    await this._initRoutes();
    await this._initExceptionFilters();
    await this._initServer();
  }
}
