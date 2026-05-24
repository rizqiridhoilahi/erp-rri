CREATE TABLE "ai_automation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_payload" jsonb NOT NULL,
	"agent_type" text NOT NULL,
	"result" jsonb,
	"success" boolean DEFAULT true,
	"error_message" text,
	"executed_by" uuid,
	"executed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_data_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_type" text DEFAULT 'data-agent',
	"user_id" uuid NOT NULL,
	"task_type" text NOT NULL,
	"prompt" jsonb NOT NULL,
	"response" jsonb NOT NULL,
	"tokens_used" integer,
	"latency_ms" integer,
	"status" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_nego_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid,
	"user_id" uuid NOT NULL,
	"barang_id" uuid,
	"prompt" jsonb NOT NULL,
	"response" jsonb NOT NULL,
	"reasoning_chain" text,
	"harga_dimintaan" integer,
	"harga_counter" integer,
	"margin_percent" numeric(5, 2),
	"recommendation" text,
	"approval_level" text,
	"risk_score" numeric(3, 1),
	"status" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_vision_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_type" text DEFAULT 'vision-agent',
	"user_id" uuid NOT NULL,
	"file_name" text,
	"file_url" text,
	"source_type" text,
	"extracted_data" jsonb NOT NULL,
	"confidence_score" numeric(3, 2),
	"model_used" text,
	"tokens_used" integer,
	"latency_ms" integer,
	"status" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_opname" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"gudang_id" text,
	"petugas" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_opname_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "stock_opname_item" (
	"id" text PRIMARY KEY NOT NULL,
	"stock_opname_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"stok_sistem" integer DEFAULT 0 NOT NULL,
	"stok_fisik" integer,
	"selisih" integer DEFAULT 0 NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_kontak" (
	"id" text PRIMARY KEY NOT NULL,
	"supplier_id" text NOT NULL,
	"nama" text NOT NULL,
	"jabatan" text,
	"no_hp" text,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_payment" (
	"id" text PRIMARY KEY NOT NULL,
	"purchase_order_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"nominal" real NOT NULL,
	"tanggal_bayar" timestamp NOT NULL,
	"metode" text DEFAULT 'transfer' NOT NULL,
	"bukti_transfer" text,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
