"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { podeGerirExercicio } from "@/lib/authz";
import { registrarAuditoria } from "@/lib/audit";

type R = { ok: true } | { ok: false; error: string };

function ehP2002(e: unknown) {
  return e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002";
}

export async function criarExercicio(ano: number): Promise<R> {
  const u = await getCurrentUser();
  if (!podeGerirExercicio(u)) return { ok: false, error: "Sem permissão." };
  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100)
    return { ok: false, error: "Ano inválido." };
  try {
    const c = await prisma.exercicio.create({ data: { ano } });
    await registrarAuditoria({
      usuarioId: u.id === "dev-user" ? null : u.id,
      entidade: "Exercicio",
      entidadeId: c.id,
      acao: "CRIAR",
      dadosDepois: { ano },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: ehP2002(e) ? "Exercício já existe." : "Falha ao criar exercício." };
  }
}

export async function definirStatusExercicio(
  id: string,
  status: "ABERTO" | "ENCERRADO"
): Promise<R> {
  const u = await getCurrentUser();
  if (!podeGerirExercicio(u)) return { ok: false, error: "Sem permissão." };
  try {
    await prisma.exercicio.update({ where: { id }, data: { status } });
    await registrarAuditoria({
      usuarioId: u.id === "dev-user" ? null : u.id,
      entidade: "Exercicio",
      entidadeId: id,
      acao: status === "ABERTO" ? "ABRIR" : "ENCERRAR",
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao atualizar o exercício." };
  }
}
