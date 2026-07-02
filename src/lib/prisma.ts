import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 usa driver adapters: o client recebe a connection string via adapter.
// Runtime usa DATABASE_URL (pooled do Neon). Migrations usam DIRECT_URL (ver prisma.config.ts).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Usa a MESMA conexão da migração (não-pooled/direct do Neon) para garantir
  // que runtime e migrations acessem o mesmo banco/estado. O pooler (PgBouncer)
  // do Neon com o adapter-pg causava "tabela não existe"/confusão de sessão.
  // Migrar para @prisma/adapter-neon (pooled correto) fica como melhoria.
  // IMPORTANTE: preferir as variáveis Emendas_* (banco da integração que tem as
  // tabelas). A integração também cria DATABASE_URL/POSTGRES_URL SEM prefixo que
  // apontam para OUTRO banco (Neon Auth) — usá-las dá "table does not exist".
  // DATABASE_URL só é usada como último recurso (dev local).
  const connectionString =
    process.env.Emendas_DATABASE_URL_UNPOOLED ??
    process.env.Emendas_POSTGRES_URL_NON_POOLING ??
    process.env.Emendas_DATABASE_URL ??
    process.env.DATABASE_URL;
  if (!connectionString) {
    // Não derruba a importação do módulo: a falha só ocorre se/quando uma query
    // for executada (enquanto o Neon não está configurado — ver PROMPT 2).
    // Leituras de UI degradam para estado vazio via try/catch nos callers.
    console.warn(
      "[prisma] DATABASE_URL não definida — as queries falharão até preencher o .env."
    );
  }
  const adapter = new PrismaPg({ connectionString: connectionString ?? "" });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
