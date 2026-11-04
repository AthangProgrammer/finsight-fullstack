import { z } from 'zod';

export const MAX_LIMIT = 50;

const digits = z.string().regex(/^\d+$/, 'Must be a whole number').transform(Number);
const isoDate = z.iso.date();

export const idParams = z.object({ id: z.uuid() }).strict();

export const listQuery = z
  .object({
    page: digits.pipe(z.number().int().min(1).max(100000)).default(1),
    limit: digits.pipe(z.number().int().min(1)).transform((n) => Math.min(n, MAX_LIMIT)).default(20),
    q: z.string().trim().min(1).max(100).optional(),
    categoryId: digits.optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    sort: z.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).default('date_desc'),
  })
  .strict();

const fields = {
  description: z.string().trim().min(1).max(120),
  amount: z.number().min(0.01).max(10000000),
  categoryId: z.number().int().min(1),
  spentOn: isoDate,
};

export const createBody = z.object(fields).strict();

export const patchBody = z
  .object(fields)
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

export const budgetBody = z.object({ monthlyAmount: z.number().min(0).max(10000000) }).strict();

export const summaryQuery = z
  .object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM').optional() })
  .strict();

export const exportQuery = z.object({}).strict();
