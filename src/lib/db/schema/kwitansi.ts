import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const kwitansi = pgTable("kwitansi", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
  tanggal: timestamp("tanggal").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});