import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const deliveryOrder = pgTable("delivery_order", {
  id: text("id").primaryKey(),
  salesOrderId: text("sales_order_id").notNull(),
  tanggal: timestamp("tanggal").notNull(),
  status: text("status").notNull().default('draft'), // draft, awaiting_pickup, dikirim, selesai
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});