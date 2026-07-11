/*
  Warnings:

  - You are about to drop the column `item` on the `orders` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stockItemId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "item",
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "stockItemId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "orders_stockItemId_idx" ON "orders"("stockItemId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
