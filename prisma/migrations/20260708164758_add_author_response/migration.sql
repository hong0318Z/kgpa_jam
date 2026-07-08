-- CreateTable
CREATE TABLE "AuthorResponse" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthorResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthorResponse_submissionId_idx" ON "AuthorResponse"("submissionId");

-- AddForeignKey
ALTER TABLE "AuthorResponse" ADD CONSTRAINT "AuthorResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorResponse" ADD CONSTRAINT "AuthorResponse_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
