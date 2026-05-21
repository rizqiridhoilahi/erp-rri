import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const grn = pgTable("grn", {
  id: text("id").primaryKey(),
  purchaseReceivingId: text("purchase_receiving_id"),
  diId: text("di_id"),
  tanggal: timestamp("tanggal").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});