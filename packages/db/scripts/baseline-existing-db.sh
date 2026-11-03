#!/usr/bin/env bash
# Use when the database was created with `prisma db push` before migrations existed.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Applying schema delta (role, newsletter fields)..."
psql "$DATABASE_URL" << 'SQL'
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER';
ALTER TABLE "NewsletterSubscription" ADD COLUMN IF NOT EXISTS "unsubscribeToken" TEXT;
ALTER TABLE "NewsletterSubscription" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "NewsletterSubscription" SET "unsubscribeToken" = gen_random_uuid()::text WHERE "unsubscribeToken" IS NULL;
ALTER TABLE "NewsletterSubscription" ALTER COLUMN "unsubscribeToken" SET NOT NULL;
ALTER TABLE "NewsletterSubscription" ALTER COLUMN "updatedAt" DROP DEFAULT;
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscription_unsubscribeToken_key" ON "NewsletterSubscription"("unsubscribeToken");
SQL

echo "Marking initial migration as applied..."
npx prisma migrate resolve --applied 20260101000000_init

echo "Done. Run: pnpm db:migrate"
