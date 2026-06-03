import { sql } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const grnCustomer = pgTable("grn_customer", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  nomor: text("nomor").notNull().unique(),
  returPenjualanId: text("retur_penjualan_id"),
  deliveryOrderId: text("delivery_order_id"),
  customerId: text("customer_id"),
  gudangId: text("gudang_id"),
  tanggal: timestamp("tanggal").notNull(),
  status: text("status").notNull().default("draft"),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
