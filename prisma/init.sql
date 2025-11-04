-- SQL migration to create tables in Supabase
-- Execute this SQL in Supabase SQL Editor

-- Create Campaign table
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- Create Headline table
CREATE TABLE IF NOT EXISTS "Headline" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Headline_pkey" PRIMARY KEY ("id")
);

-- Create Image table
CREATE TABLE IF NOT EXISTS "Image" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- Create Creative table
CREATE TABLE IF NOT EXISTS "Creative" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "headlineId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
);

-- Create Foreign Keys
ALTER TABLE "Headline" ADD CONSTRAINT "Headline_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Image" ADD CONSTRAINT "Image_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_headlineId_fkey" FOREIGN KEY ("headlineId") REFERENCES "Headline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Unique Constraint
CREATE UNIQUE INDEX IF NOT EXISTS "Creative_headlineId_imageId_campaignId_key" ON "Creative"("headlineId", "imageId", "campaignId");

-- Create indexes for optimization
CREATE INDEX IF NOT EXISTS "Headline_campaignId_idx" ON "Headline"("campaignId");
CREATE INDEX IF NOT EXISTS "Image_campaignId_idx" ON "Image"("campaignId");
CREATE INDEX IF NOT EXISTS "Creative_campaignId_idx" ON "Creative"("campaignId");

