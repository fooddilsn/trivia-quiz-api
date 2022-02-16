import * as path from 'path';
import { StringValue } from 'ms';
import { LoggerLevel } from '../logger/logger.interfaces';
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
  logger: {
    level: process.env.LOGGER_LEVEL as LoggerLevel,
    pretty: process.env.LOGGER_PRETTY === 'true',
    redact: process.env.LOGGER_REDACT?.split(','),
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    migrations: {
      mongodb: {
        url: process.env.MONGODB_URI,
        databaseName: '',
      },
      migrationsDir: path.resolve(
        __dirname,
        `../migrations/${process.env.MONGODB_MIGRATIONS_FOLDER}`
      ),
      changelogCollectionName: 'changelog',
      migrationFileExtension: '.js',
      useFileHash: false,
    },
  },
  auth: {
    jwt: {
      issuer: process.env.JWT_ISSUER,
      algorithm: 'RS256',
      publicKey: process.env.JWT_PUBLIC_KEY,
      privateKey: process.env.JWT_PRIVATE_KEY,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
      },
    },
  },
});
