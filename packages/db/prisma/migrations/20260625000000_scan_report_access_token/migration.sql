-- AlterTable
ALTER TABLE "ScanReport" ADD COLUMN "accessToken" TEXT;

-- Backfill existing rows with unique tokens
UPDATE "ScanReport" SET "accessToken" = gen_random_uuid()::text WHERE "accessToken" IS NULL;

-- Set NOT NULL and unique constraint
ALTER TABLE "ScanReport" ALTER COLUMN "accessToken" SET NOT NULL;
CREATE UNIQUE INDEX "ScanReport_accessToken_key" ON "ScanReport"("accessToken");
