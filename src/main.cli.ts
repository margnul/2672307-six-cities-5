#!/usr/bin/env node
import { HelpCommand } from './cli/help.command.js';
import { VersionCommand } from './cli/version.command.js';
import { ImportCommand } from './cli/import.command.js';
import { GenerateCommand } from './cli/generate.command.js';

// Импортируем зависимости для работы с БД
import { DefaultUserService } from './shared/modules/user/default-user.service.js';
import DefaultOfferService from './shared/modules/offer/default-offer.service.js';
import { UserModel } from './shared/modules/user/user.entity.js';
import { OfferModel } from './shared/modules/offer/offer.entity.js';

// Замени этот импорт на путь к твоему логгеру, если он называется иначе
import { PinoLogger } from './shared/libs/logger/pino.logger.js';

class CLIApplication {
  private commands: Record<string, any> = {};
  private defaultCommand = '--help';

  constructor() {
    this.registerCommands();
  }

  private registerCommands() {
    const logger = new PinoLogger();

    const userService = new DefaultUserService(logger, UserModel);
    const offerService = new DefaultOfferService(OfferModel);

    const salt = 'cli-secret-salt';

    const helpCommand = new HelpCommand();
    const versionCommand = new VersionCommand();

    const importCommand = new ImportCommand(userService, offerService, salt);

    const generateCommand = new GenerateCommand();

    this.commands[helpCommand.getName()] = helpCommand;
    this.commands[versionCommand.getName()] = versionCommand;
    this.commands[importCommand.getName()] = importCommand;
    this.commands[generateCommand.getName()] = generateCommand;
  }

  public processCommand(argv: string[]) {
    const [, , commandName, ...parameters] = argv;
    const command = this.commands[commandName] ?? this.commands[this.defaultCommand];
    command.execute(...parameters);
  }
}

const cliApp = new CLIApplication();
cliApp.processCommand(process.argv);
