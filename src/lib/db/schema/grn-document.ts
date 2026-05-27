import { sql } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { grn } from "./grn";

export const grnDocument = pgTable("grn_document", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  grnId: text("grn_id").notNull().references(() => grn.id, { onDelete: "cascade" }),
 fileName: text("file_name").notNull(),
 fileUrl: text("file_url").notNull(),
 driveFileId: text("drive_file_id"),
 uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
