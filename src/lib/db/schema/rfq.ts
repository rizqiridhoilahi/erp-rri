import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const rfq = pgTable("rfq", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  tanggal: timestamp("tanggal").notNull(),
  keterangan: text("keterangan"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});