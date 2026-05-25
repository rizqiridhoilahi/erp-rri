CREATE TABLE "customer_po_document" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"customer_po_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"drive_file_id" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "di_document" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"di_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"drive_file_id" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grn_document" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"grn_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"drive_file_id" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
