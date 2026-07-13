-- CreateEnum
CREATE TYPE "SubmissionFileKind" AS ENUM ('MAIN', 'SIMILARITY_REPORT', 'FINAL_MANUSCRIPT');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "finalManuscriptSubmittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SubmissionFile" ADD COLUMN     "kind" "SubmissionFileKind" NOT NULL DEFAULT 'MAIN';

