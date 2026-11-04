import { models } from '@finsight/database';
import { HttpError } from '../lib/HttpError.js';
import { COOKIE_NAME, issueToken, verifyToken } from '../lib/token.js';

const REISSUE_BELOW_SECONDS = 10 * 60;

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (typeof token !== 'string') throw new HttpError(401, 'Not authenticated');

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new HttpError(401, 'Not authenticated');
    }

    const user = await models.User.findByPk(payload.sub);
    if (!user || user.tokenVersion !== payload.tv) throw new HttpError(401, 'Not authenticated');

    if (payload.exp - Math.floor(Date.now() / 1000) < REISSUE_BELOW_SECONDS) issueToken(res, user);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
