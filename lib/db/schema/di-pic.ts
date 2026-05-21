import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const diPic = pgTable("di_pic", {
  id: text("id").primaryKey(),
  diId: text("di_id").notNull(),
  customerPicId: text("customer_pic_id").notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});