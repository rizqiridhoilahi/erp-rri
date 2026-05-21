import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const jurnal = pgTable("jurnal", {
  id: text("id").primaryKey(),
  tanggal: timestamp("tanggal").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});