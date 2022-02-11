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

export interface Config {
  service: ServiceMetadata;
  env: NodeEnv;
  server: ServerConfig;
}
