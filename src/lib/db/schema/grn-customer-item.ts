import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const grnCustomerItem = pgTable("grn_customer_item", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  grnCustomerId: text("grn_customer_id").notNull(),
  barangId: text("barang_id").notNull(),
  jumlah: integer("jumlah").notNull(),
  namaBarang: text("nama_barang"),
  kodeBarang: text("kode_barang"),
  satuan: text("satuan"),
  urutan: integer("urutan"),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
