import { pgTable, text, jsonb, integer, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const aiDataHistory = pgTable('ai_data_history', {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  agentType: text('agent_type').notNull().default('data-agent'),
  userId: text("user_id").notNull(),
  taskType: text('task_type').notNull(),
  prompt: jsonb('prompt').notNull(),
  response: jsonb('response').notNull(),
  tokensUsed: integer('tokens_used'),
  latencyMs: integer('latency_ms'),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
