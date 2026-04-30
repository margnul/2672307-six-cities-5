import convict from 'convict';
import validator from 'convict-format-with-validator';

convict.addFormats(validator);

export type RestSchema = {
  PORT: number;
  DB_IP: string;
  SALT: string;
  DB_NAME: string;
  MONGO_INITDB_ROOT_USERNAME: string;
  MONGO_INITDB_ROOT_PASSWORD: string;
  UPLOAD_DIRECTORY: string;
  JWT_SECRET: string;
}

export const configRestSchema = convict<RestSchema>({
  PORT: {
    doc: 'Port for incoming connections',
    format: 'port',
    default: 4000,
    env: 'PORT',
  },
  DB_IP: {
    doc: 'IP address of the database server',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'DB_IP',
  },
  SALT: {
    doc: 'Salt for password hashing',
    format: String,
    default: null,
    env: 'SALT',
  },
  DB_NAME: {
    doc: 'Database name',
    format: String,
    default: 'six-cities',
    env: 'DB_NAME',
  },
  MONGO_INITDB_ROOT_USERNAME: {
    doc: 'MongoDB user name',
    format: String,
    default: 'admin',
    env: 'MONGO_INITDB_ROOT_USERNAME',
  },
  MONGO_INITDB_ROOT_PASSWORD: {
    doc: 'MongoDB password',
    format: String,
    default: 'test',
    env: 'MONGO_INITDB_ROOT_PASSWORD',
  },
  UPLOAD_DIRECTORY: {
    doc: 'Directory for uploaded files',
    format: String,
    default: '/upload',
    env: 'UPLOAD_DIRECTORY',
  },
  JWT_SECRET: {
    doc: 'Secret for signing JWT',
    format: String,
    env: 'JWT_SECRET',
    default: null
  },
});
