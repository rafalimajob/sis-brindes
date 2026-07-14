# Arquitetura

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 (config CSS-first, sem `tailwind.config.js`) |
| Gráficos | Recharts |
| Ícones | lucide-react |
| Banco de dados | PostgreSQL |
| ORM | Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`) |
| Autenticação | NextAuth 4 (Credentials Provider, sessão JWT) + MFA/TOTP próprio |
| E-mail | Resend (produção) / log no console (dev) |
| Planilhas | ExcelJS (exportação de relatórios) |
| Container local | Docker Compose (Postgres) |

> **Next.js 16 tem mudanças que quebram padrões de versões anteriores.** O mais relevante no
> código: `params` de rotas dinâmicas (API e páginas) é uma `Promise` e precisa de `await`.
> Veja `AGENTS.md` antes de alterar qualquer rota — e confira `node_modules/next/dist/docs/`
> se algo parecer não bater com o que se espera de Next.js "clássico".

## Visão geral do fluxo de dados

O app segue consistentemente o padrão **Server Component busca dados → Client Component
renderiza e interage**:

1. Uma página em `src/app/(app)/<modulo>/page.tsx` é um **Server Component** que consulta o
   Prisma diretamente, mapeia o resultado para um DTO simples (definido em `src/types/`) e
   passa como prop para um componente client.
2. O componente client (em `src/components/<modulo>/`) guarda o estado local (lista, filtros,
   modais abertos) e faz `fetch()` para as rotas de API quando o usuário cria/edita/exclui algo,
   atualizando o estado local com a resposta — não há revalidação de cache do Next.js nem
   bibliotecas de data-fetching (SWR/React Query); é `fetch` + `useState` direto.
3. Toda regra de negócio "não trivial" (que mexe em saldo de estoque, ou depende de mais de uma
   tabela) fica centralizada em `src/lib/*.ts` (`movements.ts`, `orders.ts`) e é executada dentro
   de uma transação Prisma (`prisma.$transaction`) — nunca na rota da API diretamente nem no
   client.

Esse padrão se repete em Pedidos, Estoque, Movimentações, Kits, Consumo por área e Usuários.

## Por que a lógica de negócio fica em `src/lib/`, não nas rotas

A rota de API (`src/app/api/**/route.ts`) faz apenas: checar sessão/permissão, validar o shape
do body, chamar a função de `lib/`, e traduzir erros do Prisma para uma resposta amigável
(`src/lib/api-errors.ts`). Isso existe para que:

- A mesma operação (ex.: `applyMovement`) nunca seja reimplementada de formas ligeiramente
  diferentes em dois lugares (ex.: uma rota de Movimentações e uma de Consumo por área que na
  prática geram o mesmo tipo de registro).
- O saldo de estoque (`StockItem.quantity`) tenha um único caminho de escrita.

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/            # layout com card centralizado — login, cadastro, MFA, verificação de e-mail
│   ├── (app)/             # layout com Sidebar+Header — todas as telas autenticadas
│   │   ├── dashboard/
│   │   ├── pedidos/
│   │   ├── estoque/
│   │   ├── movimentacoes/
│   │   ├── consumo-area/
│   │   ├── kits/
│   │   ├── relatorios/
│   │   └── usuarios/      # admin-only
│   └── api/               # rotas de API (ver docs/API.md)
├── components/
│   ├── ui/                # primitivos compartilhados (Button, Card, Modal, Badge, ...)
│   ├── layout/             # Sidebar, Header, ThemeToggle
│   ├── providers/          # SessionProvider, script de tema (evita flash)
│   └── <modulo>/           # componentes client de cada módulo
├── lib/                    # regra de negócio, auth, MFA, e-mail, relatórios, cores
├── types/                  # DTOs usados entre Server Component e Client Component
└── generated/prisma/        # client Prisma gerado (não versionado, ver .gitignore)
```

## Autoria e auditoria obrigatórias

Toda escrita relevante grava **quem fez** e **o quê mudou**:

- `StockItem.createdById` / `updatedById`, `Movement.performedById`, `KitOutput.performedById`
  são campos obrigatórios (não nulos) e usam `onDelete: Restrict` — um usuário nunca pode ser
  apagado do banco se tiver qualquer histórico vinculado a ele. Isso é proposital: a
  rastreabilidade não pode se perder por causa de uma exclusão. É por isso que "excluir usuário"
  na tela de Usuários na prática **desativa** o acesso (ver `docs/AUTENTICACAO_E_SEGURANCA.md`).
- Toda ação relevante (criar/editar/excluir pedido, item de estoque, movimentação, kit, área,
  usuário) grava uma linha em `HistoryLog` via `src/lib/history.ts`, com um resumo legível e um
  diff campo-a-campo em JSON. **Não existe hoje nenhuma tela ou rota de API que leia esse
  histórico de volta** — os dados são gravados mas não há UI de auditoria ainda (ver
  `docs/MANUTENCAO.md`, seção "Lacunas conhecidas").

## Design tokens e tema claro/escuro

Ver `docs/DESIGN_SYSTEM.md` para a paleta de cores e os componentes de UI compartilhados.
