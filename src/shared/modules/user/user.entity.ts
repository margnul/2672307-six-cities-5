import { defaultClasses, getModelForClass, prop, modelOptions } from '@typegoose/typegoose';
import { User, UserType } from '../../../types/user.type.js';
import { createSHA256 } from '../../helpers/common.js';

export interface UrerEntity extends defaultClasses.Base { }

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true,
  }
})
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({ required: true })
  public name!: string;

  @prop({ unique: true, required: true })
  public email!: string;

  @prop({ required: false, default: '' })
  public avatarUrl!: string;

  @prop({ required: true })
  public type!: UserType;

  @prop({ required: true, default: '' })
  public password?: string;

  @prop({ type: () => [String], default: [] })
  public favorites!: string[];

  public setPassword(password: string, salt: string) {
    this.password = createSHA256(password, salt);
  }

  public verifyPassword(password: string, salt: string): boolean {
    const hashPassword = createSHA256(password, salt);
    return hashPassword === this.password;
  }

  public getPassword() {
    return this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
