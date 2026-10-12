-- CreateTable
CREATE TABLE "Artwork" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "pixelArt" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "originalKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "originalSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "widths" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Artwork_published_createdAt_idx" ON "Artwork"("published", "createdAt");
