import { Router } from 'express';
import { pipeline } from 'node:stream/promises';
import { models } from '@finsight/database';
import { csvRows, queryRows } from '../lib/csv.js';
import { expensesXml } from '../lib/xml.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { exportQuery } from '../schemas/expenses.js';

const { Expense, Category } = models;

const EXPORT_CAP = 10000;
const COLUMNS = ['id', 'date', 'description', 'category', 'amount'];

const fetchPage = (userId) => async (limit, offset) => {
  const rows = await Expense.findAll({
    where: { userId },
    include: [{ model: Category, attributes: ['name'] }],
    order: [['spentOn', 'DESC'], ['id', 'ASC']],
    limit,
    offset,
  });
  return rows.map((row) => ({
    id: row.id,
    date: row.spentOn,
    description: row.description,
    category: row.Category.name,
    amount: Number(row.amount).toFixed(2),
  }));
};

const attachment = (res, type, filename) =>
  res.set({
    'Content-Type': `${type}; charset=utf-8`,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'X-Content-Type-Options': 'nosniff',
  });

export const exportRouter = Router();
exportRouter.use(requireAuth);

exportRouter.get('/expenses.csv', async (req, res, next) => {
  try {
    exportQuery.parse(req.query);
    attachment(res, 'text/csv', 'expenses.csv');
    await pipeline(queryRows(fetchPage(req.user.id), EXPORT_CAP), csvRows(COLUMNS), res);
  } catch (err) {
    if (res.headersSent) res.destroy(err);
    else next(err);
  }
});

exportRouter.get('/expenses.xml', async (req, res, next) => {
  try {
    exportQuery.parse(req.query);
    const rows = [];
    for await (const row of queryRows(fetchPage(req.user.id), EXPORT_CAP)) rows.push(row);
    attachment(res, 'application/xml', 'expenses.xml');
    res.send(expensesXml(rows));
  } catch (err) {
    next(err);
  }
});
