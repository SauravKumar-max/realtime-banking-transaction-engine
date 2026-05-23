CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'BLOCKED', 'FROZEN', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('SAVINGS', 'CURRENT');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'BLOCKED', 'COMPLETED', 'FAILED', 'FINALIZED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('DEBIT', 'CREDIT');--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "type" SET DATA TYPE "public"."account_type" USING "type"::"public"."account_type";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"public"."account_status";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "status" SET DATA TYPE "public"."account_status" USING "status"::"public"."account_status";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "public"."transaction_type" USING "type"::"public"."transaction_type";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" SET DATA TYPE "public"."transaction_status" USING "status"::"public"."transaction_status";