import { Router } from 'express';
import { Op } from 'sequelize';
import { models, sequelize } from '@finsight/database';
import { requireAuth } from '../middleware/requireAuth.js';
import { summaryQuery } from '../schemas/expenses.js';

const { Expense, Category } = models;

const SERIES_MONTHS = 6;

const monthKey = (year, monthIndex) => new Date(Date.UTC(year, monthIndex, 1)).toISOString().slice(0, 7);

export const summaryRouter = Router();
summaryRouter.use(requireAuth);

summaryRouter.get('/', async (req, res, next) => {
  try {
    const { month = new Date().toISOString().slice(0, 7) } = summaryQuery.parse(req.query);
    const [year, monthNumber] = month.split('-').map(Number);
    const start = `${month}-01`;
    const end = `${monthKey(year, monthNumber)}-01`;
    const seriesStart = `${monthKey(year, monthNumber - SERIES_MONTHS)}-01`;
    const userId = req.user.id;

    const [byCategory, seriesRows] = await Promise.all([
      Expense.findAll({
        attributes: ['categoryId', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
        where: { userId, spentOn: { [Op.gte]: start, [Op.lt]: end } },
        include: [{ model: Category, attributes: ['name'] }],
        group: ['Expense.category_id', 'Category.id'],
        order: [[sequelize.literal('total'), 'DESC']],
        raw: true,
        nest: true,
      }),
      Expense.findAll({
        attributes: [
          [sequelize.fn('to_char', sequelize.col('spent_on'), 'YYYY-MM'), 'month'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        ],
        where: { userId, spentOn: { [Op.gte]: seriesStart, [Op.lt]: end } },
        group: ['month'],
        raw: true,
      }),
    ]);

    const totals = new Map(seriesRows.map((row) => [row.month, Number(row.total)]));
    const series = Array.from({ length: SERIES_MONTHS }, (_, i) => {
      const key = monthKey(year, monthNumber - SERIES_MONTHS + i);
      return { month: key, total: totals.get(key) ?? 0 };
    });

    res.json({
      month,
      total: series.at(-1).total,
      byCategory: byCategory.map((row) => ({
        categoryId: row.categoryId,
        category: row.Category.name,
        total: Number(row.total),
      })),
      series,
    });
  } catch (err) {
    next(err);
  }
});
