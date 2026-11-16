import { index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const links = pgTable(
  'links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    originalUrl: varchar('original_url', { length: 2048 }).notNull(),
    shortUrl: varchar('short_url', { length: 100 }).notNull().unique(),
    accessCount: integer('access_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [index('links_created_at_idx').on(table.createdAt)],
)
