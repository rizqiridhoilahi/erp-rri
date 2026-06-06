import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { customer } from "./customer";

export const customerPrompt = pgTable("customer_prompt", {
  customerId: text("customer_id").primaryKey().references(() => customer.id, { onDelete: "cascade" }),
  promptTemplate: text("prompt_template").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
