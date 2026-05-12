ALTER TABLE "accounts" ALTER COLUMN "createdAt" SET DEFAULT 1778570348324;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "createdAt" SET DEFAULT 1778570348325;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT 1778570348324;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "updatedAt" integer DEFAULT 1778570348324 NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "updatedAt" integer DEFAULT 1778570348325 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "passwordHash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updatedAt" integer DEFAULT 1778570348324 NOT NULL;