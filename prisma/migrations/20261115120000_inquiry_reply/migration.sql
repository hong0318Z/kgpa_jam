-- AlterEnum
ALTER TYPE "InquiryStatus" ADD VALUE 'REPLIED';

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "replyMessage" TEXT,
ADD COLUMN "repliedAt" TIMESTAMP(3),
ADD COLUMN "repliedById" TEXT;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_repliedById_fkey" FOREIGN KEY ("repliedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
