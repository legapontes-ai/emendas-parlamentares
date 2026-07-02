import { prisma } from "@/lib/prisma";
import { semear } from "@/lib/seed-data";

// Rota de bootstrap ÚNICA e AUTO-DESABILITÁVEL: só executa se o token conferir
// e se ainda não houver nenhum usuário. Usada uma vez após o primeiro deploy
// com banco; deve ser removida em seguida.
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
    return new Response("Forbidden", { status: 403 });
  }

  let count: number;
  try {
    count = await prisma.user.count();
  } catch {
    return Response.json(
      { ok: false, erro: "Falha ao acessar o banco. Migrations aplicadas?" },
      { status: 500 }
    );
  }
  if (count !== 0) {
    return Response.json(
      { ok: false, motivo: "Já existem usuários — bootstrap desabilitado.", usuarios: count },
      { status: 409 }
    );
  }

  const resumo = await semear(prisma);
  return Response.json({ ok: true, resumo });
}
