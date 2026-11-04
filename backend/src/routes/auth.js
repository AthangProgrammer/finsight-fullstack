import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { models } from '@finsight/database';
import { HttpError } from '../lib/HttpError.js';
import { audit } from '../lib/audit.js';
import { clearToken, issueToken } from '../lib/token.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { loginSchema, registerSchema } from '../schemas/auth.js';

const { User } = models;

const BCRYPT_COST = 12;
const LOCK_AFTER_FAILURES = 5;
const MAX_LOCK_MINUTES = 30;
const INVALID_LOGIN = 'Invalid username or password.';

const dummyHash = await bcrypt.hash('not-a-real-password', BCRYPT_COST);

const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts, try again later.' },
});

const publicUser = (user) => ({ id: user.id, username: user.username });

export const authRouter = Router();

authRouter.post('/register', ipLimiter, async (req, res, next) => {
  try {
    const { username, password } = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    let user;
    try {
      user = await User.create({ username, passwordHash });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') throw new HttpError(409, 'Username is not available.');
      throw err;
    }
    audit(req, 'register', user.id);
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', ipLimiter, async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const user = await User.scope('withPassword').findOne({ where: { username } });
    const matches = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      audit(req, 'login.locked', user.id);
      throw new HttpError(401, INVALID_LOGIN);
    }

    if (!user || !matches) {
      if (user) {
        const failedLoginCount = user.failedLoginCount + 1;
        const lockMinutes = Math.min(2 ** (failedLoginCount - LOCK_AFTER_FAILURES), MAX_LOCK_MINUTES);
        await user.update({
          failedLoginCount,
          lockedUntil: failedLoginCount >= LOCK_AFTER_FAILURES ? new Date(Date.now() + lockMinutes * 60_000) : null,
        });
      }
      audit(req, 'login.failure', user?.id);
      throw new HttpError(401, INVALID_LOGIN);
    }

    await user.update({ failedLoginCount: 0, lockedUntil: null });
    issueToken(res, user);
    audit(req, 'login.success', user.id);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await req.user.increment('tokenVersion');
    clearToken(res);
    audit(req, 'logout', req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});
