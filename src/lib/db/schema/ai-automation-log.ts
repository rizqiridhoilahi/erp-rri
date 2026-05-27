import { pgTable, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const aiAutomationLog = pgTable('ai_automation_log', {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  triggerType: text('trigger_type').notNull(),
  triggerPayload: jsonb('trigger_payload').notNull(),
  agentType: text('agent_type').notNull(),
  result: jsonb('result'),
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  executedBy: text("executed_by"),
  executedAt: timestamp('executed_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
