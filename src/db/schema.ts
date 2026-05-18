import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id:          text('id').primaryKey(),
  tanggal:     text('tanggal').notNull(),
  jam:         text('jam').default('').notNull(),
  lokasi:      text('lokasi').default('').notNull(),
  area:        text('area').default('').notNull(),
  nama_acara:  text('nama_acara').default('').notNull(),
  last_update: text('last_update').default('').notNull(),
  link_acara:  text('link_acara').default('').notNull(),
  hash:        text('hash').default('').notNull(),
  created_at:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at:  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Auto-generated types
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
