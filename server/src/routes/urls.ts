import { desc, eq, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db/index.js'
import { links } from '../db/schema.js'
import { HttpError } from '../errors.js'
import { createLinksCsv, uploadLinksCsv } from '../services/csv.js'

const createLinkSchema = z.object({
  originalUrl: z.url().max(2048).refine((value) => {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  }, 'The original URL must use HTTP or HTTPS.')
    .refine((value) => /^https?:\/\/[^\\\s]+$/i.test(value), 'The original URL must be a valid HTTP or HTTPS URL.')
    .refine(hasCompleteDomain, 'The original URL must use a complete domain name.'),
  shortUrl: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9-]+$/, 'Use only letters, numbers, and hyphens for the short URL.'),
})

const idSchema = z.uuid()
const slugSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9-]+$/)

function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown, message: string) {
  const result = schema.safeParse(value)
  if (!result.success) throw new HttpError(400, message)
  return result.data
}

export async function registerUrlRoutes(app: FastifyInstance) {
  app.post('/urls', async (request, reply) => {
    const input = parseOrThrow(createLinkSchema, request.body, 'Informe uma URL original válida e um slug com letras, números ou hífens.')

    try {
      const [link] = await db.insert(links).values(input).returning()
      return reply.code(201).send(link)
    } catch (error) {
      if (isUniqueViolation(error)) throw new HttpError(409, 'Esse link encurtado já está em uso.')
      throw error
    }
  })

  app.get('/urls', async () => db.select().from(links).orderBy(desc(links.createdAt)))

  app.delete<{ Params: { id: string } }>('/urls/:id', async (request, reply) => {
    const id = parseOrThrow(idSchema, request.params.id, 'ID de link inválido.')
    const [deleted] = await db.delete(links).where(eq(links.id, id)).returning({ id: links.id })
    if (!deleted) throw new HttpError(404, 'Link não encontrado.')
    return reply.code(204).send()
  })

  app.get<{ Params: { slug: string } }>('/urls/:slug', async (request) => {
    const slug = parseOrThrow(slugSchema, request.params.slug, 'Link encurtado inválido.')
    const [link] = await db.update(links)
      .set({ accessCount: sql.raw('"access_count" + 1') })
      .where(eq(links.shortUrl, slug))
      .returning({ originalUrl: links.originalUrl })

    if (!link) throw new HttpError(404, 'Link não encontrado.')
    return link
  })

  app.get('/urls/export', async (_request, reply) => {
    const rows = await db.select().from(links).orderBy(desc(links.createdAt))
    const publicUrl = await uploadLinksCsv(createLinksCsv(rows))
    return reply.redirect(publicUrl, 302)
  })
}

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error
  const visited = new Set<unknown>()

  while (typeof current === 'object' && current !== null && !visited.has(current)) {
    visited.add(current)
    if ('code' in current && current.code === '23505') return true
    current = 'cause' in current ? current.cause : null
  }

  return false
}

function hasCompleteDomain(value: string) {
  try { return new URL(value).hostname.includes('.') } catch { return false }
}
