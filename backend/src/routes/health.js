import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', async (req, res, next) => {
  if (req.query.db !== '1') {
    res.json({ status: 'ok' });
    return;
  }
  try {
    const { pingDatabases } = await import('@finsight/database');
    const databases = await pingDatabases();
    const healthy = Object.values(databases).every((state) => state === 'up');
    res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'degraded', databases });
  } catch (error) {
    next(error);
  }
});
