import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.url(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_BUCKET: z.string().optional(),
  CLOUDFLARE_PUBLIC_URL: z.preprocess((value) => value === '' ? undefined : value, z.url().optional()),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => issue.path.join('.') + ': ' + issue.message).join('\n')
  throw new Error('Invalid server environment:\n' + details)
}

export const env = parsed.data

export function getR2Config() {
  const config = {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
    bucket: env.CLOUDFLARE_BUCKET,
    publicUrl: env.CLOUDFLARE_PUBLIC_URL,
  }

  if (Object.values(config).some((value) => !value)) {
    throw new Error('Cloudflare R2 is not fully configured.')
  }

  return config as {
    accountId: string
    accessKeyId: string
    secretAccessKey: string
    bucket: string
    publicUrl: string
  }
}
