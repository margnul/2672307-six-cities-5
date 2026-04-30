import { UserService } from './user-service.interface.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { createSHA256 } from '../../helpers/common.js';
import { LoginUserDto } from './dto/login-user.dto.js';

@injectable()
export class DefaultUserService implements UserService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>
  ) { }

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const passwordHash = createSHA256(dto.password, salt);

    const result = await this.userModel.create({ ...dto, password: passwordHash });

    this.logger.info(`New user created: ${dto.email}`);
    return result;
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({ email });
  }

  public async findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByEmail(dto.email);

    if (existedUser) {
      return existedUser;
    }

    return this.create(dto, salt);
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.userModel.exists({ _id: documentId })) !== null;
  }

  public async verifyUser(dto: LoginUserDto, salt: string): Promise<DocumentType<UserEntity> | null> {
    const user = await this.findByEmail(dto.email);

    if (!user) {
      return null;
    }

    if (user.verifyPassword(dto.password, salt)) {
      return user;
    }

    return null;
  }

  public async updateFavorite(userId: string, offerId: string, isFavorite: boolean): Promise<void> {
    const updateQuery = isFavorite
      ? { $addToSet: { favorites: offerId } } // Добавляем, если еще нет
      : { $pull: { favorites: offerId } }; // Удаляем

    await this.userModel.findByIdAndUpdate(userId, updateQuery).exec();
  }

  public async getFavorites(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).exec();
    return user?.favorites || [];
  }
}
