import { pgTable, text, jsonb, integer, numeric, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const aiNegoHistory = pgTable('ai_nego_history', {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  quotationId: text("quotation_id"),
  userId: text("user_id").notNull(),
  barangId: text("barang_id"),
  prompt: jsonb('prompt').notNull(),
  response: jsonb('response').notNull(),
  reasoningChain: text('reasoning_chain'),
  hargaDimintaan: integer('harga_dimintaan'),
  hargaCounter: integer('harga_counter'),
  marginPercent: numeric('margin_percent', { precision: 5, scale: 2 }),
  recommendation: text('recommendation'),
  approvalLevel: text('approval_level'),
  riskScore: numeric('risk_score', { precision: 3, scale: 1 }),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
