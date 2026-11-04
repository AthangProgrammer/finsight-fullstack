import { Router } from 'express';
import { healthRouter } from './health.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);

for (const name of ['auth', 'expenses', 'budget', 'categories', 'summary', 'insights', 'export']) {
  apiRouter.use(`/${name}`, Router());
}
