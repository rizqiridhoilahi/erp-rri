import { pgTable, text, timestamp, integer, real } from "drizzle-orm/pg-core";

export const quotationItem = pgTable("quotation_item", {
  id: text("id").primaryKey(),
  quotationId: text("quotation_id").notNull(),
  barangId: text("barang_id").notNull(),
  hargaSatuan: real("harga_satuan").notNull(),
  diskon: real("diskon").default(0),
  ppnPerItem: real("ppn_per_item"),
  jumlah: integer("jumlah").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});