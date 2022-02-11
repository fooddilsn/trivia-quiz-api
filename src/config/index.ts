import { Config, NodeEnv } from './config.interfaces';

export * from './config.interfaces';
export * from './config.schema';

export default (): Config => ({
  service: {
    name: process.env.npm_package_name,
    version: process.env.npm_package_version,
  },
  env: process.env.NODE_ENV as NodeEnv,
  server: {
    host: process.env.HOST,
    port: parseInt(process.env.PORT, 10),
  },
});
