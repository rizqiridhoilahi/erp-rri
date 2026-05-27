import { sql } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { rfqCustomer } from "./rfq-customer";
import { customerPic } from "./customer-pic";

export const rfqCustomerPic = pgTable("rfq_customer_pic", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  rfqCustomerId: text("rfq_customer_id").notNull().references(() => rfqCustomer.id, { onDelete: "cascade" }),
  customerPicId: text("customer_pic_id").notNull().references(() => customerPic.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});
