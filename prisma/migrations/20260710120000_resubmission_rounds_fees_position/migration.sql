-- DropIndex
DROP INDEX "ReviewAssignment_submissionId_reviewerId_key";

-- AlterTable
ALTER TABLE "ReviewAssignment" ADD COLUMN     "round" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "round" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "position" TEXT;

-- CreateTable
CREATE TABLE "FeeSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountHolder" TEXT,
    "reviewPayoutPerReview" INTEGER,
    "authorReviewFeePerSubmission" INTEGER,
    "publicationFeePerPage" INTEGER,
    "publicationFeeFlat" INTEGER,
    "urgentPublicationFeeExtra" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "FeeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewAssignment_submissionId_reviewerId_round_key" ON "ReviewAssignment"("submissionId", "reviewerId", "round");

-- AddForeignKey
ALTER TABLE "FeeSettings" ADD CONSTRAINT "FeeSettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

