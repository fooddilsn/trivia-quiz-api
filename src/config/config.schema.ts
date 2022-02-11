import * as Joi from 'joi';
import { NodeEnv } from './config.interfaces';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .required(),
  HOST: Joi.string(),
  PORT: Joi.number().required(),
});
