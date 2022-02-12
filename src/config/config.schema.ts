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
});
