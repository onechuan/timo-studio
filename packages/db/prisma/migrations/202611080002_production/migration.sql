CREATE TABLE "Production" (
  "projectId" UUID NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 0,
  "jobId" TEXT,
  "data" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Production_pkey" PRIMARY KEY ("projectId"),
  CONSTRAINT "Production_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
