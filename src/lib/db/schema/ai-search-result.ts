import { pgTable, text, timestamp, real } from "drizzle-orm/pg-core";

export const aiSearchResult = pgTable("ai_search_result", {
  id: text("id").primaryKey(),
  aiSearchHistoryId: text("ai_search_history_id").notNull(),
  nama: text("nama").notNull(),
  harga: real("harga").notNull(),
  toko: text("toko").notNull(),
  link: text("link").notNull(),
  marketplace: text("marketplace").notNull(),
  rating: real("rating"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});