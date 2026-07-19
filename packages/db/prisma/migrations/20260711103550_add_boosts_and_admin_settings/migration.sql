-- AlterEnum
ALTER TYPE "PaymentPurpose" ADD VALUE 'COMPANY_BOOST';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "boostExpiresAt" TIMESTAMP(3),
ADD COLUMN     "isBoosted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "jobId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "boostPriceKobo" INTEGER NOT NULL DEFAULT 500000,
    "boostDurationDays" INTEGER NOT NULL DEFAULT 7,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
