import { sql } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { grnCustomer } from "./grn-customer";

export const grnCustomerDocument = pgTable("grn_customer_document", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  grnCustomerId: text("grn_customer_id").notNull().references(() => grnCustomer.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  driveFileId: text("drive_file_id"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
