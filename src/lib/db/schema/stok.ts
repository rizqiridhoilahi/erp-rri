import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const stok = pgTable("stok", {
  id: text("id").primaryKey(),
  barangId: text("barang_id").notNull(),
  gudangId: text("gudang_id"),
  jumlah: integer("jumlah").notNull(),
  lastMutasi: timestamp("last_mutasi").notNull().defaultNow(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});