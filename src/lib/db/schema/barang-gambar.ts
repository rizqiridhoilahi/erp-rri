import { sql } from "drizzle-orm"
import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { barang } from "./barang";

export const barangGambar = pgTable("barang_gambar", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  barangId: text("barang_id").notNull().references(() => barang.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  urutan: integer("urutan").notNull().default(0),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
