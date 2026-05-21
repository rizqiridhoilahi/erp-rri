import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const purchaseRequest = pgTable("purchase_request", {
  id: text("id").primaryKey(),
  salesOrderId: text("sales_order_id"),
  tanggal: timestamp("tanggal").notNull(),
  keterangan: text("keterangan"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});