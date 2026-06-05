import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";

export const paymentTerm = pgTable("payment_term", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 nama: text("nama").notNull().unique(),
 isActive: boolean("is_active").notNull().default(true),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentTermItem = pgTable("payment_term_item", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 paymentTermId: text("payment_term_id").notNull().references(() => paymentTerm.id, { onDelete: "cascade" }),
 urutan: integer("urutan").notNull(),
 deskripsi: text("deskripsi").notNull(),
 persentase: numeric("persentase", { precision: 5, scale: 2 }).notNull().$type<number>(),
 dueDays: integer("due_days").notNull().default(0),
 createdAt: timestamp("created_at").notNull().defaultNow(),
});
