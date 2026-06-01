import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const emailLog = pgTable("email_log", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 toEmail: text("to_email").notNull(),
 toNama: text("to_nama"),
 subject: text("subject").notNull(),
 body: text("body"),
 status: text("status").notNull().default("pending"),
 errorMessage: text("error_message"),
 referenceType: text("reference_type"),
 referenceId: text("reference_id"),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
