-- CreateEnum
CREATE TYPE "VolumeType" AS ENUM ('JOURNAL', 'CONFERENCE');

-- AlterTable
ALTER TABLE "Volume" ADD COLUMN "type" "VolumeType" NOT NULL DEFAULT 'JOURNAL';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "conferenceEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "conferenceInfoText" TEXT;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "award" TEXT;
