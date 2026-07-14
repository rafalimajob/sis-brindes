# Autenticação, MFA e controle de acesso

## Visão geral do fluxo

```
Cadastro ──► Confirmação de e-mail ──► Aprovação de um admin ──► Configuração de MFA (1ª vez)
                                                                          │
                                                                          ▼
                                                              Login normal (senha + TOTP/backup code)
```

Não existe login sem os três: e-mail confirmado, conta aprovada, e MFA validado. A única exceção
ao terceiro item é o navegador marcado como confiável por até 30 dias (ver "Confiar neste
navegador" abaixo) — a senha, porém, **nunca** é dispensada, em nenhum cenário.

### 1. Cadastro (`POST /api/auth/register`)

Cria o `User` com `role: USER`, `status: PENDING` (padrão do schema), senha com hash bcrypt
(custo 12), e envia um e-mail com link de confirmação (`VerificationToken`, validade 24h). Em
desenvolvimento, sem `EMAIL_API_KEY` configurado, o link é apenas **logado no console** do
servidor em vez de enviado de verdade (`src/lib/mail.ts`).

### 2. Confirmação de e-mail (`POST /api/auth/verify-email`)

Valida o token (propósito e expiração) e, em uma transação, marca `User.emailVerified` e apaga o
token. Sem isso, o login é bloqueado com uma mensagem explícita.

### 3. Aprovação por um administrador

Mesmo com e-mail confirmado, `status` continua `PENDING` até um `ADMIN` aprovar em
`/usuarios` (`PATCH /api/users/[id]`, `{ status: "ACTIVE" }`). **Não existe fluxo de
autoaprovação** — alguém com papel `ADMIN` precisa agir. Enquanto pendente, tentar logar retorna
403 com "Seu cadastro está aguardando aprovação de um administrador."

Depois de aprovado, um admin também pode **desativar** o acesso a qualquer momento
(`status: "DEACTIVATED"`) — o login passa a ser bloqueado com uma mensagem própria, mas o
usuário e todo o histórico vinculado a ele continuam no banco (ver "Por que não existe exclusão
de verdade" abaixo).

### 4. Primeiro login → configuração obrigatória de MFA

`POST /api/auth/login/precheck` (chamado pela tela de login) verifica e-mail/senha e o `status`;
se `mfaEnabled` ainda for `false`, devolve um ticket de bootstrap e o front redireciona para
`/mfa-setup`. Lá:

1. `POST /api/auth/mfa/setup` gera um secret TOTP novo e o QR code — o secret **ainda não é
   gravado no banco**, viaja apenas dentro de um ticket assinado (`mfa-setup-pending`, 10 min).
2. O usuário escaneia o QR (Google Authenticator, Authy etc.) e digita o primeiro código.
3. `POST /api/auth/mfa/verify` valida esse código contra o secret pendente e **só então**
   persiste `mfaEnabled: true`, `mfaSecret` (criptografado) e 10 backup codes (hasheados).
   Devolve os backup codes em texto puro **uma única vez** — não há como recuperá-los depois,
   só gerar novos (não há endpoint de regeneração hoje, ver `docs/MANUTENCAO.md`).
4. A sessão é criada (`signIn("credentials", { ticket })`) sem pedir o código de novo, já que a
   posse do autenticador acabou de ser comprovada.

### 5. Logins seguintes

`precheck` emite um ticket de `mfa-challenge`; a tela `/mfa-challenge` pede o código de 6
dígitos (ou um backup code como alternativa) e chama `signIn("credentials", { ticket, totpCode })`
— o NextAuth valida tudo dentro de `authorize()` em `src/lib/auth.ts`. **Exceção**: se o navegador
tiver o cookie de confiança válido para essa conta (ver seção abaixo), `precheck` pula direto para
o passo 6 sem pedir TOTP.

### 6. Confiar neste navegador (30 dias)

Na tela de configuração inicial do MFA (após validar o 1º código) e na tela de desafio de todo
login seguinte, existe um checkbox **"Confiar neste navegador por 30 dias"**. Ao marcar:

1. Depois que o `signIn` estabelece a sessão, o client chama `POST /api/auth/trust-device`
   (sessão obrigatória).
2. Essa rota emite um ticket de propósito `trusted-device` (HMAC assinado, 30 dias) e grava como
   cookie **httpOnly, `secure` em produção, `sameSite: lax`** — nunca acessível via JS no
   navegador.
3. Em cada `login/precheck` seguinte, se `user.mfaEnabled` for `true`, o servidor primeiro checa
   esse cookie: se válido e o `userId` dentro dele bater com o usuário que está logando, emite um
   ticket de propósito `trusted-device-login` (5 min) em vez de `mfa-challenge` — o front então
   chama `signIn` direto com esse ticket, sem pedir TOTP nem backup code.

**O que continua igual, sem exceção**: a senha é sempre exigida em todo login, independente do
cookie. O cookie só dispensa o *segundo fator*, nunca o primeiro. `authorize()` também
re-valida ao vivo no banco (`emailVerified`, `mfaEnabled`, `status === "ACTIVE"`) antes de aceitar
o ticket — se o admin desativar a conta ou o MFA for reconfigurado nesse meio-tempo, o cookie
antigo deixa de funcionar automaticamente, mesmo antes de expirar.

**Escopo**: o cookie é assinado com o `userId` embutido — ele só libera login sem TOTP para a
*mesma conta* que o gerou. Se outra pessoa usar o mesmo navegador com um e-mail diferente, o
cookie simplesmente não bate e o fluxo normal de MFA é exigido.

**Trade-off aceito conscientemente**: um navegador confiável comprometido/roubado dentro da
janela de 30 dias permite entrar só com a senha daquela conta. Não há hoje uma tela de "gestão de
dispositivos confiáveis" para listar/revogar cookies individualmente — a única forma de revogar
todos de uma vez é gerar um novo `AUTH_SECRET` (invalida todos os tickets/cookies assinados do
sistema inteiro, inclusive sessões ativas) ou aguardar a expiração natural de 30 dias.

## Tickets assinados (`src/lib/tickets.ts`)

Em vez de reenviar a senha entre as etapas do login, cada etapa emite um ticket HMAC-SHA256
assinado (verificado com comparação em tempo constante) com expiração curta (exceto o cookie de
confiança, que é de propósito intencionalmente longo):

| Propósito | Emitido em | Consumido em | Validade | Carrega o secret TOTP? |
|---|---|---|---|---|
| `mfa-setup-bootstrap` | `login/precheck` (MFA ainda não configurado) | `mfa/setup` | 5 min | não |
| `mfa-setup-pending` | `mfa/setup` | `mfa/verify` | 10 min | sim |
| `mfa-challenge` | `login/precheck` (MFA já configurado) | `authorize()` do NextAuth | 5 min | não |
| `mfa-verified` | `mfa/verify` (após validar o 1º código) | `authorize()` do NextAuth | 5 min | não |
| `trusted-device` | `POST /api/auth/trust-device` (cookie httpOnly) | `login/precheck` (leitura do cookie) | 30 dias | não |
| `trusted-device-login` | `login/precheck` (cookie de confiança válido) | `authorize()` do NextAuth | 5 min | não |

## Criptografia e hashing (`src/lib/mfa.ts`)

- Senha de login: bcrypt, custo 12.
- `mfaSecret` (o secret TOTP): **AES-256-GCM**, chave vinda de `MFA_ENCRYPTION_KEY` (32 bytes em
  hex — gerar com `openssl rand -hex 32`). O módulo lança erro **na importação** se essa env var
  não estiver no formato certo, então a aplicação nem sobe sem ela configurada corretamente.
- Backup codes: 10 códigos gerados com alfabeto sem caracteres ambíguos, guardados como hash
  bcrypt — cada um funciona uma única vez (`consumeBackupCode` remove o hash usado do array).
- Comparação de e-mail/senha inexistente usa um `DUMMY_HASH` fixo para o bcrypt sempre rodar,
  evitando que o tempo de resposta revele se um e-mail existe ou não no banco.

## Controle de acesso (papéis)

Dois papéis: `ADMIN` e `USER`. A única checagem de papel do sistema inteiro está centralizada em
`src/lib/require-admin.ts` (`requireAdmin()`), usada pelas rotas `api/users/*` e pela página
`/usuarios` (que redireciona para `/dashboard` se `session.user.role !== "ADMIN"`). Não há
middleware global (`src/middleware.ts` não existe) — cada rota/página protegida chama
`getServerSession` e decide por conta própria; esse é o padrão a seguir se novas áreas
admin-only forem criadas.

### O que um `ADMIN` pode fazer em `/usuarios`

- Aprovar (`PENDING → ACTIVE`), desativar/reativar, promover/remover admin, e "excluir".
- **Proteções embutidas** (em `api/users/[id]/route.ts`):
  - Ninguém pode alterar a própria conta por essa tela (evita se autodesativar/rebaixar por
    engano).
  - O sistema nunca deixa remover o último `ADMIN` ativo — seja por rebaixamento, desativação
    ou exclusão (`isLastActiveAdmin()`/`wouldRemoveLastActiveAdmin()`).

### Por que não existe exclusão de verdade na prática

Toda ação de estoque/pedido/movimentação/kit exige um autor (`onDelete: Restrict` nas FKs de
autoria — ver `docs/BANCO_DE_DADOS.md`). Por isso, excluir um usuário que já tenha qualquer
histórico falha com um erro de integridade referencial (Prisma `P2003`), e a rota devolve uma
mensagem orientando a desativar em vez de excluir. Só é possível apagar de verdade um usuário que
nunca tenha criado/alterado nada.

## Bootstrap do primeiro administrador

Não existe fluxo de auto-promoção a admin pela UI (faria sentido seria um risco de segurança
óbvio). Para colocar o primeiro `ADMIN` funcional em um banco novo, depois do cadastro normal
pela tela de registro (ou do seed, ver `docs/BANCO_DE_DADOS.md`), promova manualmente no banco:

```sql
UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE email = 'seu-email@dominio.com';
```

A partir daí, esse usuário consegue entrar em `/usuarios` e aprovar/gerenciar os demais pela
interface normalmente.

## Variáveis de ambiente relevantes para segurança

Ver `.env.example` na raiz do projeto:

- `AUTH_SECRET` — segredo do NextAuth (sessão JWT). Gerar com `openssl rand -base64 32`.
- `MFA_ENCRYPTION_KEY` — obrigatória, formato estrito (32 bytes hex), usada para criptografar o
  secret TOTP em repouso.
- `EMAIL_FROM` / `EMAIL_API_KEY` — envio real de e-mail de confirmação via Resend; sem
  `EMAIL_API_KEY`, o link é só logado no console (modo dev).
