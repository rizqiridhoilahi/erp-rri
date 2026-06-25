import { sql } from "drizzle-orm"
import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const clientLogo = pgTable("client_logo", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  altText: text("alt_text").notNull(),
  fileUrl: text("file_url").notNull(),
  urutan: integer("urutan").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
