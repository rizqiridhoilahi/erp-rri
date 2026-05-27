import { sql } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { customerPo } from "./customer-po";

export const customerPoDocument = pgTable("customer_po_document", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  customerPoId: text("customer_po_id").notNull().references(() => customerPo.id, { onDelete: "cascade" }),
 fileName: text("file_name").notNull(),
 fileUrl: text("file_url").notNull(),
 driveFileId: text("drive_file_id"),
 uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
