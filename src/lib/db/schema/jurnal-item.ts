import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const jurnalItem = pgTable("jurnal_item", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 jurnalId: text("jurnal_id").notNull(),
 akunId: text("akun_id").notNull(),
 debit: numeric("debit", { precision: 18, scale: 2 }).notNull().default("0").$type<number>(),
 credit: numeric("credit", { precision: 18, scale: 2 }).notNull().default("0").$type<number>(),
 keterangan: text("keterangan"),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow(),
});