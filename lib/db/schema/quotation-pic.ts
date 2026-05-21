import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const quotationPic = pgTable("quotation_pic", {
  id: text("id").primaryKey(),
  quotationId: text("quotation_id").notNull(),
  customerPicId: text("customer_pic_id").notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});