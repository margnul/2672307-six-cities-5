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

  // 1. Инициализация базы данных
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

  // 2. Настройка сервера (порт)
  private async _initServer() {
    this.logger.info('Try to init server...');
    const port = this.config.get('PORT');
    this.server.listen(port);
    this.logger.info(`🚀 Server started on http://localhost:${port}`);
  }

  // 3. Регистрация Middleware (express.json — требование ТЗ)
  private async _initMiddleware() {
    this.logger.info('Initializing middleware...');
    this.server.use(express.json());
  }

  // 4. Регистрация маршрутов
  private async _initRoutes() {
    this.logger.info('Initializing routes...');
    this.server.use('/offers', this.offerController.router);
    this.server.use('/comments', this.commentController.router);
  }

  // 5. Регистрация фильтров исключений (ДОЛЖНЫ БЫТЬ В КОНЦЕ)
  private async _initExceptionFilters() {
    this.logger.info('Initializing exception filters...');
    // .bind нужен, чтобы не потерять контекст this внутри метода catch
    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }

  public async init() {
    this.logger.info('Application initialization...');

    // Выполняем шаги строго по порядку
    await this._initDb();
    await this._initMiddleware();
    await this._initRoutes();
    await this._initExceptionFilters(); // Ошибки ловим только после роутов
    await this._initServer();
  }
}
