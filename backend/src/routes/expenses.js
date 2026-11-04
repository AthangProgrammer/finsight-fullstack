import { Router } from 'express';
import { Op } from 'sequelize';
import { models } from '@finsight/database';
import { HttpError } from '../lib/HttpError.js';
import { expenseJson } from '../lib/serialize.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { createBody, idParams, listQuery, patchBody } from '../schemas/expenses.js';

const { Expense, Category } = models;

const SORTS = {
  date_desc: [['spentOn', 'DESC'], ['id', 'ASC']],
  date_asc: [['spentOn', 'ASC'], ['id', 'ASC']],
  amount_desc: [['amount', 'DESC'], ['id', 'ASC']],
  amount_asc: [['amount', 'ASC'], ['id', 'ASC']],
};

const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');
const withCategory = [{ model: Category, attributes: ['name'] }];

async function ensureCategory(categoryId) {
  if (categoryId !== undefined && !(await Category.findByPk(categoryId, { attributes: ['id'] }))) {
    throw new HttpError(400, 'Unknown category');
  }
}

async function findOwned(req) {
  const { id } = idParams.parse(req.params);
  const expense = await Expense.findOne({ where: { id, userId: req.user.id }, include: withCategory });
  if (!expense) throw new HttpError(404, 'Not found');
  return expense;
}

export const expensesRouter = Router();
expensesRouter.use(requireAuth);

expensesRouter.get('/', async (req, res, next) => {
  try {
    const { page, limit, q, categoryId, from, to, sort } = listQuery.parse(req.query);
    const where = { userId: req.user.id };
    if (q) where.description = { [Op.iLike]: `%${escapeLike(q)}%` };
    if (categoryId !== undefined) where.categoryId = categoryId;
    if (from || to) where.spentOn = { ...(from && { [Op.gte]: from }), ...(to && { [Op.lte]: to }) };

    const { rows, count } = await Expense.findAndCountAll({
      where,
      include: withCategory,
      order: SORTS[sort],
      limit,
      offset: (page - 1) * limit,
    });
    res.json({ items: rows.map(expenseJson), page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

expensesRouter.post('/', async (req, res, next) => {
  try {
    const body = createBody.parse(req.body);
    await ensureCategory(body.categoryId);
    const created = await Expense.create({ ...body, userId: req.user.id });
    const expense = await Expense.findByPk(created.id, { include: withCategory });
    res.status(201).json({ expense: expenseJson(expense) });
  } catch (err) {
    next(err);
  }
});

expensesRouter.get('/:id', async (req, res, next) => {
  try {
    res.json({ expense: expenseJson(await findOwned(req)) });
  } catch (err) {
    next(err);
  }
});

expensesRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = patchBody.parse(req.body);
    const expense = await findOwned(req);
    await ensureCategory(body.categoryId);
    await expense.update(body);
    res.json({ expense: expenseJson(await expense.reload({ include: withCategory })) });
  } catch (err) {
    next(err);
  }
});

expensesRouter.delete('/:id', async (req, res, next) => {
  try {
    await (await findOwned(req)).destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
