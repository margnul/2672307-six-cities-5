import { EventEmitter } from 'node:events';
import { createReadStream } from 'node:fs';
import { createInterface, Interface } from 'node:readline';

export class TSVFileReader extends EventEmitter {
  private lineReader: Interface | null = null;

  constructor(public filename: string) {
    super();
  }

  public async read(): Promise<void> {
    const readStream = createReadStream(this.filename, {
      highWaterMark: 16384,
      encoding: 'utf-8',
    });

    this.lineReader = createInterface({
      input: readStream,
      terminal: false,
    });

    let importedRowCount = 0;

    this.lineReader.on('line', (line) => {
      if (line.trim().length > 0) {
        importedRowCount++;
        this.emit('line', line);
      }
    });

    this.lineReader.on('close', () => {
      this.emit('end', importedRowCount);
    });

    await new Promise((resolve) => {
      this.lineReader?.on('close', resolve);
    });
  }

  public pause() {
    this.lineReader?.pause();
  }

  public resume() {
    this.lineReader?.resume();
  }
}
