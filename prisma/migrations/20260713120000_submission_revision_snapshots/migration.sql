-- CreateTable
CREATE TABLE "SubmissionRevisionSnapshot" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "keywords" TEXT[],
    "fields" TEXT[],
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionRevisionSnapshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubmissionRevisionSnapshot" ADD CONSTRAINT "SubmissionRevisionSnapshot_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

