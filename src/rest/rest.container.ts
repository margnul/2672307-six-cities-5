import { Container } from 'inversify';
import { RestApplication } from './rest.application.js';
import { Component } from '../shared/types/component.enum.js';
import { Logger } from '../shared/libs/logger/logger.interface.js';
import { PinoLogger } from '../shared/libs/logger/pino.logger.js';
import { Config } from '../shared/libs/config/config.interface.js';
import { RestConfig } from '../shared/libs/config/rest.config.js';
import { RestSchema } from '../shared/libs/config/rest.schema.js';
import { DatabaseClient } from '../shared/libs/database-client/database-client.interface.js';
import { MongoDatabaseClient } from '../shared/libs/database-client/mongo.database-client.js';
import { ExceptionFilter } from '../shared/libs/rest/exception-filter/exception-filter.interface.js';
import { AppExceptionFilter } from '../shared/libs/rest/exception-filter/app-exception-filter.js';

export function createRestApplicationContainer(container: Container) {
  container.bind<RestApplication>(Component.RestApplication).to(RestApplication).inSingletonScope();
  container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();
  container.bind<Config<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();
  container.bind<DatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();
  container.bind<ExceptionFilter>(Component.ExceptionFilter).to(AppExceptionFilter).inSingletonScope();
}

