import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const kwitansiItem = pgTable("kwitansi_item", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 kwitansiId: text("kwitansi_id").notNull(),
 invoiceItemId: text("invoice_item_id").notNull(),
 jumlah: numeric("jumlah", { precision: 18, scale: 2 }).notNull().$type<number>(),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow(),
});