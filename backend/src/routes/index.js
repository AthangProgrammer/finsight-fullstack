import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);

for (const name of ['expenses', 'budget', 'categories', 'summary', 'insights', 'export']) {
  apiRouter.use(`/${name}`, Router());
}
