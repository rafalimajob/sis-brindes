# Marketing Ops — Pacote de migração para Claude Code

Este pacote contém tudo que o Claude Code precisa para transformar o
protótipo (artifact React) na aplicação real: **Next.js + PostgreSQL + Prisma**.

## O que já está pronto aqui

- `prisma/schema.prisma` — schema completo de banco de dados, cobrindo os 5 módulos do briefing (Pedidos, Estoque, Movimentações, Kits, Histórico) mais Anexos e Usuário admin.
- `prisma/seed.ts` — popula o banco com os mesmos dados de demonstração do protótipo.
- `docker-compose.yml` — sobe um PostgreSQL local em segundos.
- `.env.example` — variáveis de ambiente necessárias.
- `PROJECT_STRUCTURE.md` — a árvore de pastas alvo do projeto Next.js e o mapeamento direto de cada parte do protótipo para sua versão em produção.
- `marketing-ops.jsx` (gerado na conversa anterior) — a referência de UI/UX e regras de negócio já validada com você; é o "molde" para as telas reais.

## Decisões já tomadas no schema (vale revisar antes de rodar)

1. **Movimentações têm `direction` (ENTRADA/SAIDA) + `type` específico** — assim o saldo nunca depende de interpretar um número negativo, e a UI pode filtrar por direção facilmente.
2. **Saída de kit gera um `KitOutput`** que agrupa as `Movement`s de cada item componente — você vê tanto "saíram 3 kits Boas-vindas" quanto o efeito individual em cada item do estoque.
3. **Anexos são uma tabela própria** (`Attachment`), preparada para upload real (Vercel Blob/S3) em vez de nomes de arquivo em memória.
4. **Histórico (`HistoryLog`)** guarda um `summary` legível + um `diff` em JSON, para tanto exibir a trilha de auditoria quanto permitir inspeção detalhada depois.
5. Usei `cuid()` como chave primária (mais seguro que ids sequenciais expostos) e mantive o `code` (ex: `MKT-0001`) como campo separado e único, exatamente como pedido no briefing.
6. **Autenticação atualizada**: o `User` agora suporta cadastro por e-mail (múltiplos usuários, não mais um admin único) e login em duas etapas via MFA (TOTP — Google Authenticator/Authy), **exigido em todo login, sem exceção** — não só no primeiro acesso. Adicionei `VerificationToken` para cobrir tanto a confirmação de e-mail no cadastro quanto o desafio de MFA no login. Mantive um `role` (`ADMIN`/`USER`) simples, já que o briefing não pediu níveis de permissão detalhados — dá para refinar depois sem quebrar o schema.
7. **Rastreabilidade de autoria**: cadastro/edição de item de estoque (`StockItem.createdById`/`updatedById`), toda movimentação (`Movement.performedById`) e toda saída de kit (`KitOutput.performedById`) agora são campos obrigatórios — não é possível gravar essas mudanças sem um usuário autenticado por trás. Usei `onDelete: Restrict` nessas relações de propósito: um usuário não pode ser excluído do banco se tiver histórico de ações vinculado a ele, para nunca perder essa rastreabilidade (se precisar desativar alguém, use um campo de "usuário inativo" em vez de deletar — vale adicionar isso se fizer sentido para o time).

Se algo aqui não bater com o que você imaginou, é mais barato ajustar agora no schema do que depois de gerar as migrations.

## Passo a passo

1. **Baixe os arquivos deste pacote** e coloque-os na raiz de uma pasta vazia (ex: `marketing-ops/`).
2. **Abra essa pasta no Claude Code** (`claude` no terminal, dentro da pasta).
3. **Cole o prompt abaixo** para o Claude Code como primeira mensagem — ele já tem todo o contexto necessário para começar a gerar o projeto Next.js em volta do schema pronto.

---

### Prompt para colar no Claude Code

```
Este projeto vai se tornar o "Marketing Ops": uma aplicação Next.js + PostgreSQL
+ Prisma para gerenciar pedidos de compra e estoque de um Departamento de
Marketing, substituindo planilhas.

Já tenho prontos nesta pasta:
- prisma/schema.prisma (schema completo do banco)
- prisma/seed.ts (dados de demonstração)
- docker-compose.yml (Postgres local)
- .env.example
- PROJECT_STRUCTURE.md (estrutura de pastas alvo e mapeamento protótipo -> produção)
- marketing-ops.jsx (protótipo de referência para UI, UX e regras de negócio,
  já validado — use como molde visual e funcional, não como código a ser
  copiado literalmente)

Por favor:
1. Rode `npx create-next-app@latest` (TypeScript, App Router, Tailwind, sem
   src/ fora do padrão do PROJECT_STRUCTURE.md) preservando os arquivos que já
   existem na pasta.
2. Instale as dependências: prisma, @prisma/client, shadcn/ui, lucide-react,
   recharts, next-auth (Credentials Provider), bcrypt (hash de senha), otplib
   ou speakeasy (geração/validação de TOTP para MFA), qrcode (para exibir o
   QR code de configuração do autenticador), um provedor de envio de e-mail
   (ex: Resend) para confirmação de cadastro, e uma lib de geração de XLSX/CSV
   no servidor (ex: exceljs ou papaparse).
3. Suba o Postgres local via docker-compose e rode `npx prisma migrate dev`
   para criar as tabelas a partir do schema já pronto.
4. Rode o seed (`npx prisma db seed`).
5. Gere a estrutura de pastas exatamente como descrita em PROJECT_STRUCTURE.md.
6. Implemente primeiro o módulo de Estoque (rotas de API + página), depois
   Pedidos, Movimentações, Kits, Dashboard e por fim Relatórios — nessa ordem,
   porque Movimentações e Kits dependem do Estoque já existir.
7. Para a lógica de movimentação de estoque (lib/movements.ts), use uma
   transação Prisma que grava a Movement e atualiza StockItem.quantity
   atomicamente — nunca deixe o saldo ser calculado apenas no cliente.
7b. Implemente o fluxo de autenticação assim:
    - Cadastro: nome + e-mail + senha -> cria User (role USER), gera um
      VerificationToken (purpose EMAIL_VERIFICATION) e envia e-mail de
      confirmação. Login só é liberado após emailVerified preenchido.
    - Primeiro login: se mfaEnabled = false, force a configuração do MFA
      antes de liberar o acesso (gera mfaSecret, mostra QR code via lib
      qrcode, usuário confirma com um código do app autenticador).
    - Todo login, a partir do momento em que o MFA está configurado, exige
      senha + código TOTP de 6 dígitos — sem exceção, mesmo em sessões
      recorrentes do mesmo dispositivo. Não implemente "lembrar por 30 dias"
      nem qualquer bypass de MFA.
    - Gere os backup codes no momento em que o MFA é ativado e mostre-os uma
      única vez para o usuário salvar.
    - Nunca grave mfaSecret ou senha em texto plano nos logs ou no
      HistoryLog.
7c. Rastreabilidade de autoria (obrigatória, não opcional):
    - Toda criação/edição de item de estoque grava StockItem.createdById
      (na criação) e StockItem.updatedById (a cada edição), pegando o id do
      usuário da sessão autenticada — nunca deixe esses campos serem
      preenchidos pelo cliente.
    - Toda movimentação (entrada, saída, ajuste) grava
      Movement.performedById com o id do usuário da sessão.
    - Toda saída de kit grava KitOutput.performedById, além das Movements
      individuais geradas (que também levam performedById).
    - Nas telas de Estoque, Movimentações e Kits, exiba quem fez a última
      alteração (nome do usuário, não apenas a data) — isso é o objetivo
      final desse requisito: dar visibilidade de quem fez o quê.
8. Portar a UI do marketing-ops.jsx mantendo a mesma paleta de cores, tipografia
   e comportamento (modo claro/escuro, sidebar recolhível, modais, badges de
   status), mas buscando dados via fetch nas rotas de API em vez de estado
   local.
9. Ao final de cada módulo, rode a aplicação e me mostre o resultado antes de
   seguir para o próximo.

Comece confirmando o plano comigo antes de rodar comandos que alterem a pasta.
```

---

## Depois que o Claude Code terminar o esqueleto

Coisas que vale revisar com atenção humana (não só IA) antes de ir para produção:

- **Autenticação**: o briefing pede "usuário administrador único" — está previsto no schema, mas a implementação de login/sessão precisa de decisão sobre onde guardar a senha (recomendo NextAuth com Credentials Provider + hash bcrypt).
- **Upload de anexos**: escolha o provedor (Vercel Blob é o caminho mais simples se o deploy for na Vercel) e preencha `BLOB_READ_WRITE_TOKEN` no `.env`.
- **Hospedagem do banco**: para produção, Neon ou Supabase (ambos têm free tier e Postgres gerenciado) são os caminhos mais diretos a partir da Vercel.
- **Backups**: como isso substitui planilhas oficiais do departamento, vale configurar backup automático do banco desde o primeiro dia.
