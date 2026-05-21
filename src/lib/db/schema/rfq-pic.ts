import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const rfqPic = pgTable("rfq_pic", {
  id: text("id").primaryKey(),
  rfqId: text("rfq_id").notNull(),
  customerPicId: text("customer_pic_id").notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});