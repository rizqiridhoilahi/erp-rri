import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const invoicePayment = pgTable("invoice_payment", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 invoiceId: text("invoice_id").notNull(),
 tanggal: timestamp("tanggal").notNull(),
 amount: numeric("amount", { precision: 18, scale: 2 }).notNull().$type<number>(),
 metode: text("metode").notNull().default("transfer"),
 keterangan: text("keterangan"),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
