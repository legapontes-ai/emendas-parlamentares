import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { semear } from "../src/lib/seed-data";

// Runner do seed (CLI): usa conexão direta quando disponível.
const url =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  process.env.Emendas_POSTGRES_URL_NON_POOLING ||
  process.env.Emendas_DATABASE_URL;

if (!url) {
  console.error("Defina DATABASE_URL/DIRECT_URL no .env antes de rodar o seed.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

semear(prisma)
  .then(async (resumo) => {
    console.log("Seed concluído:", resumo);
    console.log('Usuários com senha padrão "mudar@123".');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
