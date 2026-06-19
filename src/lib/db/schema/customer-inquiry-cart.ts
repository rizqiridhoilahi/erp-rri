import { pgTable, bigserial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { barang } from "./barang";

export const customerInquiryCart = pgTable("customer_inquiry_cart", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  authUserId: text("auth_user_id"),
  barangId: text("barang_id").references(() => barang.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  catatanSpesifik: text("catatan_spesifik"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
