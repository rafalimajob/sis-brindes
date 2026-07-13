-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'DEACTIVATED');

-- AlterEnum
ALTER TYPE "HistoryEntity" ADD VALUE 'USER';

-- AlterTable
-- Contas já existentes continuam funcionando como antes (ACTIVE); só cadastros
-- novos a partir daqui nascem PENDING e exigem aprovação de um administrador.
ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'PENDING';
