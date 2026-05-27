import { sql } from "drizzle-orm"
import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const userRoles = pgTable("user_roles", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 userId: text("user_id").notNull(),
 role: text("role").notNull(), // admin, manager, sales, procurement, gudang, finance, hr
 assignedAt: timestamp("assigned_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow(),
 isActive: boolean("is_active").notNull().default(true),
});