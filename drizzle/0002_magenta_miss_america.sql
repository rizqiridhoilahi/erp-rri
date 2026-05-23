CREATE TABLE "rfq_document" (
	"id" text PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
