import { Command } from './command.interface.js';
import chalk from 'chalk';
import axios from 'axios';
import { createWriteStream } from 'node:fs';
import { TSVOfferGenerator } from '../shared/libs/offer-generator/tsv-offer-generator.js';
import { MockServerData } from '../types/mock-server-data.type.js';

export class GenerateCommand implements Command {
  public getName(): string {
    return '--generate';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const offerCount = Number.parseInt(count, 10);

    if (!offerCount || !filepath || !url) {
      console.error(chalk.red('ОШИБКА: Нужно передать <n> <filepath> <url>'));
      return;
    }

    try {
      console.log(chalk.blue(`Запрашиваем данные с ${url}...`));
      const { data } = await axios.get(url);
      const mockData: MockServerData = data.info || data;

      const tsvOfferGenerator = new TSVOfferGenerator();
      const writeStream = createWriteStream(filepath, 'utf8');

      for (let i = 0; i < offerCount; i++) {
        const tsvRow = tsvOfferGenerator.generate(mockData);
        if (!writeStream.write(`${tsvRow}\n`)) {
          await new Promise((resolve) => writeStream.once('drain', resolve));
        }
      }

      writeStream.end();
      console.log(chalk.green(`✔ Сгенерировано ${offerCount} предложений в файл ${filepath}`));
    } catch (error) {
      console.error(chalk.red('Не удалось сгенерировать данные.'));
      console.error(chalk.red(error instanceof Error ? error.message : error));
    }
  }
}
