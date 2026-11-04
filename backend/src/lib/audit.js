import { AuditLog } from '@finsight/database';

export function audit(req, event, userId = null) {
  req.log.info({ event, userId }, 'auth event');
  AuditLog.create({
    event,
    userId: userId && String(userId),
    ip: req.ip,
    userAgent: req.get('user-agent')?.slice(0, 300),
  }).catch((err) => req.log.warn({ err }, 'audit write failed'));
}
