import { Router } from 'express';
import { models } from '@finsight/database';
import { requireAuth } from '../middleware/requireAuth.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const items = await models.Category.findAll({ attributes: ['id', 'name'], order: [['id', 'ASC']], raw: true });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});
