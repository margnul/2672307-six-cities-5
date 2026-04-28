import { NextFunction, Request, Response } from 'express';
import multer, { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import { extension } from 'mime-types';
import { Middleware } from './middleware.interface.js';

export class UploadFileMiddleware implements Middleware {
  constructor(
    private uploadDirectory: string,
    private fieldName: string, // Название поля из запроса (например, 'avatar')
  ) { }

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const storage = diskStorage({
      destination: this.uploadDirectory,
      filename: (_req, file, callback) => {
        const fileExtension = extension(file.mimetype); // Определяем расширение (.png, .jpg)
        const filename = nanoid(); // Генерируем случайное имя
        callback(null, `${filename}.${fileExtension}`);
      }
    });

    const uploadSingleFileMiddleware = multer({ storage }).single(this.fieldName);

    uploadSingleFileMiddleware(req, res, next);
  }
}
