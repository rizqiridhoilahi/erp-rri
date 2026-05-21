import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const absensi = pgTable("absensi", {
  id: text("id").primaryKey(),
  karyawanId: text("karyawan_id").notNull(),
  tanggal: timestamp("tanggal").notNull(),
  status: text("status").notNull(), // hadir, sakit, izin, alpha
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});