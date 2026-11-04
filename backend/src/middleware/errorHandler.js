import { ZodError } from 'zod';
import { config } from '../config.js';
import { HttpError } from '../lib/HttpError.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
    return res.status(400).json({ error: 'Invalid request', issues, requestId: req.id });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, requestId: req.id });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large', requestId: req.id });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON', requestId: req.id });
  }

  req.log?.error({ err }, 'unhandled error');
  const body = { error: 'Internal server error', requestId: req.id };
  if (config.NODE_ENV === 'development') {
    body.stack = err.stack;
  }
  res.status(500).json(body);
}
