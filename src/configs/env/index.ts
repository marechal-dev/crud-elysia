import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production'] as const)
    .default('development'),
  PORT: z.coerce.number().default(3000),
});

const parseResult = envSchema.safeParse(Bun.env);

if (!parseResult.success) {
  throw new Error('Incorrect Environment Variables');
}

export const env = parseResult.data;
