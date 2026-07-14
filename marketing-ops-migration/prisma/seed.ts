/**
 * Popula o banco com os mesmos dados de demonstração do protótipo,
 * para validar rapidamente que a UI migrada bate com o que já foi
 * aprovado no Claude.ai.
 *
 * Rodar com: npx prisma db seed
 * (configurado em package.json -> "prisma": { "seed": "tsx prisma/seed.ts" })
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, OrderStatus, MovementDirection, MovementType, UserRole, UserStatus } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@marketingops.local" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@marketingops.local",
      // troque por um hash real (bcrypt/argon2) antes de subir para produção
      passwordHash: "REPLACE_WITH_REAL_HASH",
      role: UserRole.ADMIN,
      // ACTIVE explícito: sem isso o admin nasceria PENDING (padrão do schema) e
      // ninguém existiria no banco para aprová-lo, travando o primeiro login.
      status: UserStatus.ACTIVE,
      // MFA fica desativado no seed — cada usuário configura no primeiro login,
      // e a partir daí todo login exige o código, sem exceção.
      mfaEnabled: false,
    },
  });

  // Todo item de estoque exige quem o cadastrou/alterou (rastreabilidade).
  const camiseta = await prisma.stockItem.create({
    data: {
      code: "MKT-0001", name: "Camiseta institucional", category: "Camisetas",
      quantity: 42, minStock: 50, idealStock: 150, lastCost: 18.9,
      lastPurchaseDate: new Date(), location: "Almox A1",
      createdById: admin.id, updatedById: admin.id,
    },
  });
  const ecobag = await prisma.stockItem.create({
    data: {
      code: "MKT-0002", name: "Ecobag personalizada", category: "Brindes",
      quantity: 120, minStock: 40, idealStock: 100, lastCost: 6.5,
      lastPurchaseDate: new Date(), location: "Almox A2",
      createdById: admin.id, updatedById: admin.id,
    },
  });
  const squeeze = await prisma.stockItem.create({
    data: {
      code: "MKT-0003", name: "Squeeze inox 500ml", category: "Brindes",
      quantity: 18, minStock: 30, idealStock: 80, lastCost: 22.0,
      lastPurchaseDate: new Date(), location: "Almox B1",
      createdById: admin.id, updatedById: admin.id,
    },
  });
  const bloco = await prisma.stockItem.create({
    data: {
      code: "MKT-0004", name: "Bloco de anotação kraft", category: "Materiais Gráficos",
      quantity: 260, minStock: 60, idealStock: 200, lastCost: 3.2,
      lastPurchaseDate: new Date(), location: "Almox A3",
      createdById: admin.id, updatedById: admin.id,
    },
  });
  const caneta = await prisma.stockItem.create({
    data: {
      code: "MKT-0005", name: "Caneta institucional", category: "Brindes",
      quantity: 300, minStock: 100, idealStock: 300, lastCost: 1.4,
      lastPurchaseDate: new Date(), location: "Almox A3",
      createdById: admin.id, updatedById: admin.id,
    },
  });

  await prisma.order.create({
    data: {
      stockItemId: camiseta.id, quantity: 100, ocNumber: "OC-1042", project: "Trote Solidário 2026",
      status: OrderStatus.EM_TRANSPORTE, requestDate: new Date(), expectedDate: new Date(),
      notes: "Fornecedor Confecções Vitória",
    },
  });
  await prisma.order.create({
    data: {
      stockItemId: squeeze.id, quantity: 50, ocNumber: "OC-1044", project: "Trote Solidário 2026",
      status: OrderStatus.PEDIDO_ENVIADO_FORNECEDOR, requestDate: new Date("2026-06-20"),
      expectedDate: new Date("2026-06-28"), notes: "Atraso do fornecedor",
    },
  });

  // Toda movimentação exige quem a realizou (performedById).
  await prisma.movement.create({
    data: {
      direction: MovementDirection.ENTRADA, type: MovementType.COMPRA, quantity: 100,
      stockItemId: camiseta.id, project: "-", notes: "Reposição trimestral",
      performedById: admin.id,
    },
  });
  await prisma.movement.create({
    data: {
      direction: MovementDirection.SAIDA, type: MovementType.EVENTO, quantity: 58,
      stockItemId: camiseta.id, project: "Onboarding Calouros",
      performedById: admin.id,
    },
  });

  const kit = await prisma.kit.create({ data: { name: "Kit Boas-vindas" } });
  await prisma.kitItem.createMany({
    data: [
      { kitId: kit.id, stockItemId: camiseta.id, quantity: 1 },
      { kitId: kit.id, stockItemId: ecobag.id, quantity: 1 },
      { kitId: kit.id, stockItemId: bloco.id, quantity: 1 },
      { kitId: kit.id, stockItemId: caneta.id, quantity: 1 },
    ],
  });

  console.log("Seed concluído:", { admin: admin.email });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
