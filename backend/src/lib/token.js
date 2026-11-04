import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const COOKIE_NAME = 'token';

const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };

export function issueToken(res, user) {
  const token = jwt.sign({ sub: user.id, tv: user.tokenVersion }, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN,
  });
  const { exp } = jwt.decode(token);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: (exp - Math.floor(Date.now() / 1000)) * 1000 });
}

export function clearToken(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

export function verifyToken(token) {
  return jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
}
