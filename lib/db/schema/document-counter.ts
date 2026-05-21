import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const documentCounter = pgTable("document_counter", {
  kodeDokumen: text("kode_dokumen").notNull(), // SPH, SJ, INV, KWT, PO, GRN, RTJ, RTB
  tahun: integer("tahun").notNull(), // e.g., 2026
  bulan: integer("bulan").notNull(), // 1-12
  counter: integer("counter").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.kodeDokumen, table.tahun, table.bulan] }),
  };
});