import { z } from 'zod';

const username = z.string().regex(/^[a-zA-Z0-9_]{3,30}$/, 'Username must be 3-30 letters, digits or underscores');

const password = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password needs a letter')
  .regex(/\d/, 'Password needs a digit');

export const registerSchema = z.object({ username, password }).strict();

export const loginSchema = z
  .object({ username: z.string().min(1).max(30), password: z.string().min(1).max(72) })
  .strict();
