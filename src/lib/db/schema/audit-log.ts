import { pgTable, text, timestamp, jsonb, inet } from "drizzle-orm/pg-core";

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(), // e.g., CREATE, UPDATE, DELETE
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  changes: jsonb("changes"),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});