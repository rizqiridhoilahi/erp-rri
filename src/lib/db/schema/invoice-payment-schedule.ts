import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { invoice } from "./invoice";

export const invoicePaymentSchedule = pgTable("invoice_payment_schedule", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 invoiceId: text("invoice_id").notNull().references(() => invoice.id, { onDelete: "cascade" }),
 urutan: integer("urutan").notNull(),
 deskripsi: text("deskripsi").notNull(),
 persentase: numeric("persentase", { precision: 5, scale: 2 }).notNull().$type<number>(),
  jumlah: numeric("jumlah", { precision: 18, scale: 2 }).notNull().$type<number>(),
 catatan: text("catatan"),
 dueDate: timestamp("due_date"),
 status: text("status").notNull().default("pending"),
 paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0").$type<number>(),
 createdAt: timestamp("created_at").notNull().defaultNow(),
});
