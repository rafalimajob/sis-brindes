# Estrutura de pastas alvo (Next.js App Router)

Peça ao Claude Code para gerar exatamente esta estrutura (`npx create-next-app@latest` com TypeScript, Tailwind e App Router, depois ajustar):

```
marketing-ops/
├── prisma/
│   ├── schema.prisma        ← já pronto neste pacote
│   └── seed.ts              ← já pronto neste pacote
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # shell: sidebar + header + ThemeProvider
│   │   ├── page.tsx                       # redirect -> /dashboard ou /login
│   │   ├── (auth)/
│   │   │   ├── register/page.tsx          # cadastro por e-mail (nome, e-mail, senha)
│   │   │   ├── verify-email/page.tsx      # confirmação do link enviado por e-mail
│   │   │   ├── login/page.tsx             # etapa 1: e-mail + senha
│   │   │   ├── mfa-setup/page.tsx         # 1º acesso: QR code TOTP + backup codes
│   │   │   └── mfa-challenge/page.tsx     # etapa 2: código de 6 dígitos do autenticador
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx         # Módulo 1
│   │   │   ├── pedidos/page.tsx           # Módulo 2 (Server Component + tabela client)
│   │   │   ├── pedidos/[id]/page.tsx      # detalhe/edição de pedido
│   │   │   ├── estoque/page.tsx           # Módulo 3
│   │   │   ├── movimentacoes/page.tsx     # Módulo 4
│   │   │   ├── kits/page.tsx              # Módulo 5
│   │   │   └── relatorios/page.tsx        # exportação Excel/PDF
│   │   └── api/
│   │       ├── auth/register/route.ts     # POST -> cria User + envia e-mail de verificação
│   │       ├── auth/verify-email/route.ts # POST -> confirma VerificationToken, marca emailVerified
│   │       ├── auth/mfa/setup/route.ts    # POST -> gera mfaSecret + QR code + backup codes
│   │       ├── auth/mfa/verify/route.ts   # POST -> valida código TOTP e abre a sessão
│   │       ├── auth/[...nextauth]/route.ts # NextAuth (Credentials Provider)
│   │       ├── orders/route.ts            # GET (list+filter), POST (create)
│   │       ├── orders/[id]/route.ts       # GET, PATCH, DELETE
│   │       ├── stock/route.ts             # GET, POST
│   │       ├── stock/[id]/route.ts        # GET, PATCH, DELETE
│   │       ├── movements/route.ts         # GET, POST (grava Movement + atualiza StockItem em transação)
│   │       ├── kits/route.ts              # GET, POST
│   │       ├── kits/[id]/output/route.ts  # POST -> registra KitOutput + N Movements
│   │       ├── search/route.ts            # GET ?q= — busca global (orders, stock, kits)
│   │       ├── reports/[type]/route.ts    # GET -> gera CSV/XLSX de cada relatório
│   │       └── history/route.ts           # GET — trilha de auditoria
│   ├── components/
│   │   ├── ui/                # Button, Input, Select, Modal, Badge, Card (portar 1:1 do protótipo)
│   │   ├── dashboard/          # StatCard, gráficos (recharts)
│   │   ├── orders/             # OrderTable, OrderModal, StatusBadge
│   │   ├── stock/               # StockGrid, StockModal, StockLevelDot
│   │   ├── movements/           # MovementTable, MovementModal
│   │   ├── kits/                 # KitGrid, KitModal, KitOutputModal
│   │   └── layout/                # Sidebar, Header, GlobalSearch, ThemeToggle
│   ├── lib/
│   │   ├── prisma.ts           # singleton do PrismaClient
│   │   ├── movements.ts        # applyMovement(), registerKitOutput() — lógica transacional; sempre recebe performedById da sessão
│   │   ├── history.ts          # logHistory() — grava HistoryLog a cada mutação, com o userId da sessão
│   │   ├── reports.ts          # geradores de CSV/XLSX por relatório
│   │   ├── auth.ts             # config do NextAuth (Credentials Provider)
│   │   ├── mfa.ts              # geração/validação de TOTP e backup codes (otplib)
│   │   └── mail.ts             # envio do e-mail de verificação de cadastro
│   └── types/
│       └── index.ts            # tipos compartilhados (derivados do Prisma Client)
├── docker-compose.yml          ← já pronto neste pacote
├── .env.example                ← já pronto neste pacote
└── package.json
```

## Mapeamento direto: protótipo → produção

| No protótipo (artifact React) | Vira, em produção |
|---|---|
| `window.storage` (get/set por chave) | Prisma + PostgreSQL, via rotas em `app/api/*` |
| Estado local `orders/stock/movs/kits` | Server Components buscando do banco + revalidation |
| `applyMovement()` no App.jsx | `lib/movements.ts` → transação Prisma que grava `Movement` (com `performedById` obrigatório da sessão) e decrementa/incrementa `StockItem.quantity` atomicamente |
| `registerKitOutput()` | `lib/movements.ts` → cria `KitOutput` (com `performedById`) + uma `Movement` por item do kit, tudo numa única transação |
| `csvDownload()` no cliente | `app/api/reports/[type]/route.ts` gerando CSV/XLSX no servidor (mais seguro e reaproveitável) |
| Componentes de UI (`Card`, `Modal`, `Badge`, etc.) | Portáveis quase 1:1 — mesma lógica, mesmas classes Tailwind, só trocar fetch local por fetch às rotas de API |
| Anexos como nomes de arquivo em memória | Upload real (Vercel Blob/S3) + tabela `Attachment` |
