CREATE TYPE "public"."outbox_event_status" AS ENUM('PENDING', 'PUBLISHED', 'FAILED', 'DEAD_LETTER');--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"event_type" text NOT NULL,
	"event_version" integer DEFAULT 1 NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"transaction_id" text NOT NULL,
	"correlation_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "outbox_event_status" DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
UPDATE "transactions" SET "is_fraud" = false WHERE "is_fraud" IS NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "is_fraud" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "balance_before" bigint;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "balance_after" bigint;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "blocked_reason" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "correlation_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "device_fingerprint" text;--> statement-breakpoint
UPDATE "transactions" SET "correlation_id" = "transaction_id" WHERE "correlation_id" IS NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "correlation_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_aggregate_id_transactions_id_fk" FOREIGN KEY ("aggregate_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "outbox_events_status_available_at_idx" ON "outbox_events" USING btree ("status","available_at");--> statement-breakpoint
CREATE INDEX "outbox_events_correlation_id_idx" ON "outbox_events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "outbox_events_transaction_id_idx" ON "outbox_events" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "transactions_correlation_id_idx" ON "transactions" USING btree ("correlation_id");
