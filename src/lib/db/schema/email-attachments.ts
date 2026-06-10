import { sql } from "drizzle-orm"
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { emailLog } from "./email-log";

export const emailAttachments = pgTable("email_attachments", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  emailId: text("email_id").notNull().references(() => emailLog.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
