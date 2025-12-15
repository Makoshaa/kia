import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  selectedCar: varchar('selected_car', { length: 255 }).notNull(),
  purchaseMethod: varchar('purchase_method', { length: 100 }).notNull(),
  clientQuality: integer('client_quality').notNull(),
  trafficSource: varchar('traffic_source', { length: 100 }).notNull(),
  summaryDialog: text('summary_dialog').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
