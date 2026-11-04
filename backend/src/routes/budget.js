import { Router } from 'express';
import { models } from '@finsight/database';
import { requireAuth } from '../middleware/requireAuth.js';
import { budgetBody } from '../schemas/expenses.js';

const { Budget } = models;

const budgetJson = (budget) => ({ monthlyAmount: budget ? Number(budget.monthlyAmount) : 0 });

export const budgetRouter = Router();
budgetRouter.use(requireAuth);

budgetRouter.get('/', async (req, res, next) => {
  try {
    res.json({ budget: budgetJson(await Budget.findOne({ where: { userId: req.user.id } })) });
  } catch (err) {
    next(err);
  }
});

budgetRouter.put('/', async (req, res, next) => {
  try {
    const { monthlyAmount } = budgetBody.parse(req.body);
    await Budget.upsert({ userId: req.user.id, monthlyAmount });
    res.json({ budget: budgetJson(await Budget.findOne({ where: { userId: req.user.id } })) });
  } catch (err) {
    next(err);
  }
});
