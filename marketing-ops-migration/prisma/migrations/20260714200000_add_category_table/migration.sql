-- AlterEnum
ALTER TYPE "HistoryEntity" ADD VALUE 'CATEGORY';

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- Backfill: importa como categoria gerenciada cada valor já usado em
-- stock_items.category, para a lista aparecer populada na tela de
-- gerenciamento em vez de nascer vazia.
INSERT INTO "categories" ("id", "name", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, s."category", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "category" FROM "stock_items") s
ON CONFLICT ("name") DO NOTHING;
