-- AlterTable
ALTER TABLE "Volume" ADD COLUMN "infoText" TEXT,
ADD COLUMN "infoImageStoredPath" TEXT,
ADD COLUMN "infoImageMimeType" TEXT,
ADD COLUMN "infoImageSizeBytes" INTEGER;
