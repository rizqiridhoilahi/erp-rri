import { sql } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
