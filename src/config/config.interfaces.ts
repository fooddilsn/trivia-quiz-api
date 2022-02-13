import { MongooseModuleOptions } from '@nestjs/mongoose';
import { LoggerConfig } from '../logger/logger.interfaces';

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

export type MongoDBConfig = MongooseModuleOptions;

export interface Config {
  service: ServiceMetadata;
  env: NodeEnv;
  server: ServerConfig;
  logger: LoggerConfig;
  mongodb: MongoDBConfig;
}
