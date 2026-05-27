import { pgTable, text, jsonb, numeric, integer, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const aiVisionHistory = pgTable('ai_vision_history', {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  agentType: text('agent_type').notNull().default('vision-agent'),
  userId: text("user_id").notNull(),
  fileName: text('file_name'),
  fileUrl: text('file_url'),
  sourceType: text('source_type').notNull(),
  extractedData: jsonb('extracted_data').notNull(),
  confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }).notNull(),
  modelUsed: text('model_used'),
  tokensUsed: integer('tokens_used'),
  latencyMs: integer('latency_ms'),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
