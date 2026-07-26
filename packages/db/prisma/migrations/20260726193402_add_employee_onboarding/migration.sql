-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingToken" TEXT,
ADD COLUMN     "onboardingTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "employees_onboardingToken_key" ON "employees"("onboardingToken");
