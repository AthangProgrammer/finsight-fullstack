import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { connectMongo } from '@finsight/database';

connectMongo().catch((err) => logger.error({ err }, 'mongo connect failed'));

const server = createApp().listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'api listening');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
});
