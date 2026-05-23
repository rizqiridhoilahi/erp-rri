import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const rfqDocument = pgTable("rfq_document", {
  id: text("id").primaryKey(),
  rfqId: text("rfq_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
