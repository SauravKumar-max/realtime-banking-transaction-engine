ALTER TABLE "accounts" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "isFraud" TO "is_fraud";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_accountId_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "balance" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "balance" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "transaction_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transaction_id_unique" UNIQUE("transaction_id");