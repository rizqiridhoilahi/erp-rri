import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const diItem = pgTable("di_item", {
  id: text("id").primaryKey(),
  diId: text("di_id").notNull(),
  barangId: text("barang_id").notNull(),
  jumlah: integer("jumlah").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});