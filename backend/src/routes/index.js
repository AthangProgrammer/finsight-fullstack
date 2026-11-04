import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { categoriesRouter } from './categories.js';
import { expensesRouter } from './expenses.js';
import { budgetRouter } from './budget.js';
import { summaryRouter } from './summary.js';
import { exportRouter } from './export.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/expenses', expensesRouter);
apiRouter.use('/budget', budgetRouter);
apiRouter.use('/summary', summaryRouter);
apiRouter.use('/export', exportRouter);
apiRouter.use('/insights', Router());
