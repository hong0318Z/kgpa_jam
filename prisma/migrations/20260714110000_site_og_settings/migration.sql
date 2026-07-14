-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "ogDescription" TEXT,
ADD COLUMN     "ogImageMimeType" TEXT,
ADD COLUMN     "ogImageSizeBytes" INTEGER,
ADD COLUMN     "ogImageStoredPath" TEXT,
ADD COLUMN     "ogTitle" TEXT;

