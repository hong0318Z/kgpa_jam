-- CreateEnum
CREATE TYPE "ConferenceFormat" AS ENUM ('PROCEEDINGS', 'POSTER');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "conferenceFormat" "ConferenceFormat";
