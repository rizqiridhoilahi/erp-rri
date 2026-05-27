import { sql } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { di } from "./di";

export const diDocument = pgTable("di_document", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  diId: text("di_id").notNull().references(() => di.id, { onDelete: "cascade" }),
 fileName: text("file_name").notNull(),
 fileUrl: text("file_url").notNull(),
 driveFileId: text("drive_file_id"),
 uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
