import { sql } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { deliveryOrder } from "./delivery-order";

export const deliveryOrderDocument = pgTable("delivery_order_document", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  deliveryOrderId: text("delivery_order_id").notNull().references(() => deliveryOrder.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  driveFileId: text("drive_file_id"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
