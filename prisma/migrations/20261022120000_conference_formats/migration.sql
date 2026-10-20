-- AlterEnum
ALTER TYPE "ConferenceFormat" ADD VALUE 'ARTWORK';

-- AlterTable
ALTER TABLE "Volume" ADD COLUMN "conferenceFormats" "ConferenceFormat"[] DEFAULT ARRAY['PROCEEDINGS', 'POSTER']::"ConferenceFormat"[];
