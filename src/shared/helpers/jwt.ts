import { SignJWT } from 'jose';
import crypto from 'node:crypto';

export const createJWT = async (algorithm: string, jwtSecret: string, payload: object): Promise<string> => new SignJWT({ ...payload })
  .setProtectedHeader({ alg: algorithm })
  .setIssuedAt()
  .setExpirationTime('2d')
  .sign(crypto.createSecretKey(jwtSecret, 'utf-8'));
