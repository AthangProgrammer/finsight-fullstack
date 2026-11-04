import { sequelize } from './postgres/index.js';
import { models } from './postgres/models/index.js';
import { connectMongo, pingMongo } from './mongo/index.js';
import { ChatLog } from './mongo/models/ChatLog.js';
import { AuditLog } from './mongo/models/AuditLog.js';

export async function pingDatabases() {
  const result = { postgres: 'down', mongo: 'down' };
  await sequelize.query('SELECT 1').then(() => { result.postgres = 'up'; }, () => {});
  await pingMongo().then(() => { result.mongo = 'up'; }, () => {});
  return result;
}

export { sequelize, models, connectMongo, ChatLog, AuditLog };
