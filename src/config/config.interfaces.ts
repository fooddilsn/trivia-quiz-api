import { MongooseModuleOptions } from '@nestjs/mongoose';
import * as migrateMongo from 'migrate-mongo';
import { LoggerConfig } from '../logger/logger.interfaces';
import { AuthConfig } from '../auth/auth.interfaces';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export interface ServiceMetadata {
  name: string;
  version: string;
}

export interface ServerConfig {
  host?: string;
  port: number;
}

export interface MongoDBConfig extends MongooseModuleOptions {
  migrations: migrateMongo.config.Config & {
    migrationFileExtension: string;
    useFileHash: boolean;
  };
}

export interface Config {
  service: ServiceMetadata;
  env: NodeEnv;
  server: ServerConfig;
  logger: LoggerConfig;
  mongodb: MongoDBConfig;
  auth: AuthConfig;
}
