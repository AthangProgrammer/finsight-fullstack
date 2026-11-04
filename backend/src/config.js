import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGINS: z
    .string()
    .min(1)
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('30m'),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  GROQ_API_KEY: z.string().optional().transform((v) => v || undefined),
  GROQ_MODEL: z.string().min(1).default('llama-3.1-8b-instant'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = Object.freeze(parsed.data);
