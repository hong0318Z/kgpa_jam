-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "conferenceImageStoredPath" TEXT,
ADD COLUMN "conferenceImageMimeType" TEXT,
ADD COLUMN "conferenceImageSizeBytes" INTEGER;

-- CreateTable
CREATE TABLE "VolumeMaterial" (
    "id" TEXT NOT NULL,
    "volumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolumeMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VolumeMaterial_volumeId_idx" ON "VolumeMaterial"("volumeId");

-- AddForeignKey
ALTER TABLE "VolumeMaterial" ADD CONSTRAINT "VolumeMaterial_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolumeMaterial" ADD CONSTRAINT "VolumeMaterial_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
