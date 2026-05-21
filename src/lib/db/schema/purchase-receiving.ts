import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const purchaseReceiving = pgTable("purchase_receiving", {
  id: text("id").primaryKey(),
  purchaseOrderId: text("purchase_order_id").notNull(),
  tanggal: timestamp("tanggal").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});