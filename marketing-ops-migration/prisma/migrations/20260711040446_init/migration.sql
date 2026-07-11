-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('RASCUNHO', 'EM_ELABORACAO', 'AGUARDANDO_COTACAO', 'COTACAO_RECEBIDA', 'AGUARDANDO_EMISSAO_OC', 'PEDIDO_ENVIADO_FORNECEDOR', 'EM_PRODUCAO', 'EM_TRANSPORTE', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MovementDirection" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('COMPRA', 'DEVOLUCAO', 'AJUSTE_ENTRADA', 'EVENTO', 'BRINDE', 'KIT', 'CONSUMO_INTERNO', 'AJUSTE_SAIDA');

-- CreateEnum
CREATE TYPE "HistoryAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "HistoryEntity" AS ENUM ('ORDER', 'STOCK_ITEM', 'MOVEMENT', 'KIT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaBackupCodes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "ocNumber" VARCHAR(50) NOT NULL,
    "project" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'RASCUNHO',
    "requestDate" TIMESTAMP(3) NOT NULL,
    "expectedDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "photoUrl" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "idealStock" INTEGER NOT NULL DEFAULT 0,
    "lastCost" DECIMAL(10,2),
    "lastPurchaseDate" TIMESTAMP(3),
    "location" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direction" "MovementDirection" NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "project" TEXT,
    "notes" TEXT,
    "stockItemId" TEXT NOT NULL,
    "orderId" TEXT,
    "kitOutputId" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kit_items" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "kit_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kit_outputs" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "project" TEXT,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedById" TEXT NOT NULL,

    CONSTRAINT "kit_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "HistoryAction" NOT NULL,
    "entity" "HistoryEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "diff" JSONB,
    "userId" TEXT,

    CONSTRAINT "history_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_userId_idx" ON "verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_project_idx" ON "orders"("project");

-- CreateIndex
CREATE INDEX "orders_ocNumber_idx" ON "orders"("ocNumber");

-- CreateIndex
CREATE INDEX "attachments_orderId_idx" ON "attachments"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_code_key" ON "stock_items"("code");

-- CreateIndex
CREATE INDEX "stock_items_category_idx" ON "stock_items"("category");

-- CreateIndex
CREATE INDEX "stock_items_name_idx" ON "stock_items"("name");

-- CreateIndex
CREATE INDEX "movements_stockItemId_idx" ON "movements"("stockItemId");

-- CreateIndex
CREATE INDEX "movements_date_idx" ON "movements"("date");

-- CreateIndex
CREATE INDEX "movements_project_idx" ON "movements"("project");

-- CreateIndex
CREATE INDEX "movements_performedById_idx" ON "movements"("performedById");

-- CreateIndex
CREATE UNIQUE INDEX "kit_items_kitId_stockItemId_key" ON "kit_items"("kitId", "stockItemId");

-- CreateIndex
CREATE INDEX "kit_outputs_performedById_idx" ON "kit_outputs"("performedById");

-- CreateIndex
CREATE INDEX "history_logs_entity_entityId_idx" ON "history_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "history_logs_timestamp_idx" ON "history_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_kitOutputId_fkey" FOREIGN KEY ("kitOutputId") REFERENCES "kit_outputs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_items" ADD CONSTRAINT "kit_items_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_items" ADD CONSTRAINT "kit_items_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_outputs" ADD CONSTRAINT "kit_outputs_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_outputs" ADD CONSTRAINT "kit_outputs_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_logs" ADD CONSTRAINT "history_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
