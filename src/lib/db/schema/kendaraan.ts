import { sql } from "drizzle-orm"
import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const kendaraan = pgTable("kendaraan", {
 id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
 nama: text("nama").notNull(),
 noPolisi: text("no_polisi").notNull(),
 isActive: boolean("is_active").notNull().default(true),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
