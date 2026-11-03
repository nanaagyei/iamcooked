-- CreateTable
CREATE TABLE "WatchedPackage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "ecosystem" "Ecosystem" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchedPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WatchedPackage_userId_idx" ON "WatchedPackage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchedPackage_userId_packageName_ecosystem_key" ON "WatchedPackage"("userId", "packageName", "ecosystem");

-- AddForeignKey
ALTER TABLE "WatchedPackage" ADD CONSTRAINT "WatchedPackage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
