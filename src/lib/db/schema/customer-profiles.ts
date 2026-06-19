import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { customer } from "./customer";

export const customerProfiles = pgTable("customer_profiles", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  authUserId: text("auth_user_id"),
  customerId: text("customer_id").references(() => customer.id, { onDelete: "set null" }),
  namaPerusahaan: varchar("nama_perusahaan", { length: 255 }).notNull(),
  penanggungJawabPic: varchar("penanggung_jawab_pic", { length: 150 }).notNull(),
  noWhatsappPic: varchar("no_whatsapp_pic", { length: 20 }).notNull(),
  alamatPerusahaan: text("alamat_perusahaan").notNull(),
  npwpPerusahaan: varchar("npwp_perusahaan", { length: 25 }),
  statusVerifikasi: varchar("status_verifikasi", { length: 50 }).default("pending"),
  roleInternalClient: varchar("role_internal_client", { length: 50 }).default("manager"),
  parentCompanyId: text("parent_company_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_customer_profiles_customer_id").on(table.customerId),
]);
