import { Request as ExpressRequest } from 'express'; // eslint-disable-line import/no-extraneous-dependencies
import * as core from 'express-serve-static-core'; // eslint-disable-line import/no-extraneous-dependencies
import { AuthUser } from '../../auth/auth.interfaces';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Request<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>
> extends ExpressRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: AuthUser;
}
