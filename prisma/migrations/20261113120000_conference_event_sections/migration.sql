-- AlterTable
ALTER TABLE "Volume" ADD COLUMN "location" TEXT,
ADD COLUMN "host" TEXT;

-- CreateTable
CREATE TABLE "ConferenceGreeting" (
    "id" TEXT NOT NULL,
    "volumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "org" TEXT,
    "body" TEXT NOT NULL,
    "photoStoredPath" TEXT,
    "photoMimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConferenceGreeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceKeynote" (
    "id" TEXT NOT NULL,
    "volumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "timeLabel" TEXT,
    "storedPath" TEXT,
    "originalName" TEXT,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConferenceKeynote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferencePhoto" (
    "id" TEXT NOT NULL,
    "volumeId" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConferencePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConferenceGreeting_volumeId_idx" ON "ConferenceGreeting"("volumeId");

-- CreateIndex
CREATE INDEX "ConferenceKeynote_volumeId_idx" ON "ConferenceKeynote"("volumeId");

-- CreateIndex
CREATE INDEX "ConferencePhoto_volumeId_idx" ON "ConferencePhoto"("volumeId");

-- AddForeignKey
ALTER TABLE "ConferenceGreeting" ADD CONSTRAINT "ConferenceGreeting_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceKeynote" ADD CONSTRAINT "ConferenceKeynote_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferencePhoto" ADD CONSTRAINT "ConferencePhoto_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
