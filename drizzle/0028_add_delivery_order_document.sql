CREATE TABLE "delivery_order_document" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
  "delivery_order_id" text NOT NULL,
  "file_name" text NOT NULL,
  "file_url" text NOT NULL,
  "drive_file_id" text,
  "uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_order_document" ADD CONSTRAINT "delivery_order_document_delivery_order_id_fkey" FOREIGN KEY ("delivery_order_id") REFERENCES "public"."delivery_order"("id") ON DELETE CASCADE;
