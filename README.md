# Emendas Parlamentares

Sistema de Gestão de Emendas Parlamentares para o orçamento público municipal
brasileiro (PPA / LDO / LOA). Interface separada por **Poder** (Legislativo ×
Executivo), com base estruturada de dotações gerada a partir dos instrumentos de
planejamento e apresentação de emendas **sem digitação livre** de classificação
orçamentária.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **PostgreSQL** (Neon) + **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **Auth.js** (next-auth v5) — credenciais + JWT, autorização por Poder/Role
- **Tailwind CSS v4** + **shadcn/ui** · **Zod** · **Vitest**
- Deploy em **Vercel**, CI no **GitHub Actions**

## Arquitetura

Fluxo institucional refletido no sistema:

> Executivo sobe o **PROJETO_LEI** do PPA/LDO/LOA → o sistema gera a **base
> estruturada de dotações** → o Legislativo **apresenta emendas** sobre essa base
> → após sanção, o Executivo sobe a **lei aprovada** (vinculada ao PL de origem)
> → todos **acompanham** (emendas acatadas, comparativo, execução).

### Papéis e Poderes

| Poder | Papéis |
| --- | --- |
| **Executivo** | `EXEC_ADMIN`, `EXEC_PLANEJAMENTO`, `EXEC_CONSULTA` |
| **Legislativo** | `LEG_ADMIN`, `LEG_TECNICO`, `LEG_AUTOR`, `LEG_CONSULTA` |
| **Transversal** | `SUPER_ADMIN` |

A casca (hub + sidebar) deriva **100%** de `src/config/navegacao.ts`, filtrando
pela sessão — "mínimo aparente" é regra de dados. Guards no servidor
(`src/lib/access.ts`, `requireAccess`) e no `src/proxy.ts` (middleware) bloqueiam
acesso cruzado entre Poderes.

### Macro-módulos

- **Legislativo** → *Emendas* (apresentar/validar/submeter) · *Tramitação &
  Acompanhamento* (status, acatadas, relatórios).
- **Executivo** → *Planejamento & Orçamento* (instrumentos, base, lei aprovada) ·
  *Acompanhamento* (PL × lei, execução, teto por autor).
- **Transversal** → *Configurações* (parâmetros, normas LOM/RI, instrumentos,
  usuários, auditoria).

### Regras de negócio

1. Impossível cadastrar emenda fora do PPA/LDO/LOA (referencia uma `Dotacao`
   existente do instrumento base).
2. Sem digitação livre de classificação — cascata Órgão→UO→Programa→Ação→Dotação.
3. Submissão condicionada: só habilita após validação **VÁLIDA**; o servidor
   **revalida** antes de efetivar (`src/lib/validation/motorEmenda.ts`).
4. Separação por Poder no servidor; toda mutação relevante gera `AuditLog`.

## Setup local

Pré-requisitos: Node.js LTS, um projeto no **Neon** (connection strings pooled +
direct) e o `gh` CLI autenticado.

```bash
npm install
cp .env.example .env          # preencher DATABASE_URL, DIRECT_URL, AUTH_SECRET
npx auth secret               # gera AUTH_SECRET
npx prisma migrate deploy     # aplica as migrations (requer .env)
npm run seed                  # popula município fictício 2025
npm run dev                   # http://localhost:3000
```

Usuários do seed usam a senha **`mudar@123`** (ex.: `super@municipio.gov.br`,
`vereador@camara.gov.br`).

> **Modo dev sem banco:** fora de produção há um *fallback* de sessão por cookie
> (troca de perfil no cabeçalho) para navegar sem login; em produção o Auth.js é
> obrigatório.

## Modelo de conexão (Prisma 7)

Prisma 7 usa **driver adapters** (não lê `DATABASE_URL` implicitamente):

- **Runtime** (`src/lib/prisma.ts`) → `@prisma/adapter-pg` com `DATABASE_URL`
  (pooled do Neon).
- **Migrations / CLI** (`prisma.config.ts`) → `DIRECT_URL` (direta, não-pooled).

## Importação da base

Planilha **CSV/XLSX** (Configurações → Instrumentos → *Gerar base*). Colunas da
aba de dotações:

```
orgao_codigo, orgao_nome, unidade_codigo, unidade_nome, funcao_codigo,
funcao_nome, subfuncao_codigo, subfuncao_nome, programa_codigo, programa_nome,
acao_codigo, acao_nome, acao_tipo, natureza_codigo, natureza_categoria,
natureza_grupo, natureza_modalidade, natureza_elemento, fonte_codigo,
fonte_nome, valor_inicial
```

`acao_tipo` ∈ `PROJETO | ATIVIDADE | OPERACAO_ESPECIAL`. Aba `prioridades_ldo`:
`programa_codigo, acao_codigo (opcional), descricao`. Formate as colunas de
código como **Texto** para preservar zeros à esquerda.

## Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Postgres pooled — runtime |
| `DIRECT_URL` | Postgres direto — migrations |
| `AUTH_SECRET` | Segredo do Auth.js (`npx auth secret`) |
| `AUTH_URL` | URL base (produção) |

## Scripts

```bash
npm run dev        # desenvolvimento
npm run build      # prisma generate + next build
npm run start      # produção
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest (parser, integridade, motor, authz)
npm run seed       # popular banco de exemplo
```

## Deploy (Vercel)

- `vercel.json` roda `prisma generate` → `prisma migrate deploy` (só se
  `DIRECT_URL` presente) → `next build`.
- CI (`.github/workflows/ci.yml`): lint + typecheck + testes + build em cada PR.
- Cadastre as variáveis na Vercel (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
  `AUTH_URL`).

## Segurança

- Validação **Zod** em todas as bordas (server actions e importação).
- Headers de segurança (`next.config.ts`), `poweredByHeader` desligado.
- Rate limiting best-effort nas ações sensíveis (submeter, importar).
- Autorização checada no servidor por Poder/Role/autoria; nunca confia em IDs do
  cliente.
