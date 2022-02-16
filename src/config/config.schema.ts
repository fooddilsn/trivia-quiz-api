import * as Joi from 'joi';
import { LoggerLevel } from '../logger/logger.interfaces';
import { NodeEnv } from './config.interfaces';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .required(),
  HOST: Joi.string(),
  PORT: Joi.number().required(),
  LOGGER_LEVEL: Joi.string()
    .valid(...Object.values(LoggerLevel))
    .required(),
  LOGGER_PRETTY: Joi.boolean(),
  LOGGER_REDACT: Joi.string(),
  MONGODB_URI: Joi.string().required(),
  MONGODB_MIGRATIONS_FOLDER: Joi.string()
    .valid(...Object.values(['development', 'production', 'test']))
    .required(),
  JWT_ISSUER: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});
