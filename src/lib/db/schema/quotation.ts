import { pgTable, text, timestamp, boolean, real } from "drizzle-orm/pg-core";

export const quotation = pgTable("quotation", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  tanggal: timestamp("tanggal").notNull(),
  ppnRate: real("ppn_rate").notNull().default(0.11), // 11% PPN
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});