CREATE TABLE "sales_order_document" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "sales_order_id" text NOT NULL,
  "file_name" text NOT NULL,
  "file_url" text NOT NULL,
  "drive_file_id" text,
  "uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sales_order_document" ADD CONSTRAINT "sales_order_document_sales_order_id_fkey"
  FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_order"("id") ON DELETE CASCADE;
