import "dotenv/config";
import { defineConfig } from "prisma/config";

// prisma.config.ts é usado pela CLI do Prisma (generate, migrate, db push).
// Para o Neon, as migrações devem usar a conexão DIRETA (não-pooled) → DIRECT_URL.
// O runtime da aplicação usa DATABASE_URL (pooled) via driver adapter em src/lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations: conexão DIRETA (não-pooled). Aceita DIRECT_URL ou as variáveis
    // da integração Neon da Vercel (Emendas_*) como fallback.
    url:
      process.env["DIRECT_URL"] ??
      process.env["Emendas_POSTGRES_URL_NON_POOLING"] ??
      process.env["DATABASE_URL"] ??
      process.env["Emendas_DATABASE_URL"],
  },
});
