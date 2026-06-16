import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const fakturPajakItem = pgTable("faktur_pajak_item", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 fakturPajakId: text("faktur_pajak_id").notNull(),
 invoiceItemId: text("invoice_item_id").notNull(),
  hargaSatuan: numeric("harga_satuan", { precision: 18, scale: 2 }).notNull().$type<number>(),
 dpp: numeric("dpp", { precision: 18, scale: 2 }).notNull().$type<number>(),
 ppn: numeric("ppn", { precision: 18, scale: 2 }).notNull().$type<number>(),
 pph: numeric("pph", { precision: 18, scale: 2 }).$type<number>(),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow(),
});