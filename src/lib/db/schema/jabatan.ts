import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const jabatan = pgTable("jabatan", {
  id: text("id").primaryKey(),
  nama: text("nama").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});