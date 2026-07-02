# Emendas Parlamentares

Sistema de Gestão de Emendas Parlamentares para o orçamento público municipal
brasileiro (PPA / LDO / LOA). Interface separada por **Poder** (Legislativo ×
Executivo), com base estruturada de dotações gerada a partir dos instrumentos de
planejamento e apresentação de emendas sem digitação livre de classificação
orçamentária.

## Status

🚧 **Em bootstrap.** Este repositório foi inicializado (PROMPT 0 parcial: repo +
estrutura). O scaffold da aplicação (Next.js + Prisma + shadcn/ui) será executado
na sequência do playbook.

## Stack pretendida

- **Next.js** (App Router) + **TypeScript**
- **PostgreSQL** (Neon) + **Prisma**
- **Auth.js** (next-auth) — autenticação e autorização por Poder/Role
- **Tailwind CSS** + **shadcn/ui**
- Deploy em **Vercel**, CI no **GitHub Actions**

## Papéis e Poderes

**Executivo** — elabora/envia instrumentos de planejamento, sobe leis aprovadas,
acompanha execução: `EXEC_ADMIN`, `EXEC_PLANEJAMENTO`, `EXEC_CONSULTA`.

**Legislativo** — apresenta e tramita emendas sobre a base disponibilizada:
`LEG_ADMIN`, `LEG_TECNICO`, `LEG_AUTOR`, `LEG_CONSULTA`.

**Transversal** — `SUPER_ADMIN` (configura sistema, parâmetros, usuários e
repositório normativo).

Fluxo institucional: Executivo sobe o PL do PPA/LDO/LOA → o sistema gera a base
estruturada de dotações → o Legislativo apresenta emendas sobre essa base → após
sanção, o Executivo sobe a lei aprovada → todos acompanham.

## Setup local

> Preenchido no PROMPT 0 (scaffold). Por ora, requer Node.js LTS, uma conta e o
> `gh` CLI no GitHub, e um projeto no Neon com as connection strings (pooled +
> direct).

```bash
# em breve, após o scaffold:
# npm install
# cp .env.example .env   # preencher DATABASE_URL, DIRECT_URL, AUTH_SECRET
# npm run dev
```

## Variáveis de ambiente

Ver `.env.example`. Nunca versione o `.env` real.

- `DATABASE_URL` — Postgres pooled (runtime)
- `DIRECT_URL` — Postgres direto (migrations)
- `AUTH_SECRET` — segredo do Auth.js
- `AUTH_URL` — URL base da aplicação
