-- AlterEnum
ALTER TYPE "HistoryEntity" ADD VALUE 'AREA';

-- AlterTable
ALTER TABLE "movements" ADD COLUMN     "areaId" TEXT,
ADD COLUMN     "totalCost" DECIMAL(10,2),
ADD COLUMN     "unitCost" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- CreateIndex
CREATE INDEX "movements_areaId_idx" ON "movements"("areaId");

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
