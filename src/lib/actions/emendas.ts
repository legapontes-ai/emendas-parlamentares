"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { podeCriarEmenda, podeGerirEmenda, podeTramitar } from "@/lib/authz";
import { registrarAuditoria } from "@/lib/audit";
import { validarEmenda } from "@/lib/validation/motorEmenda";
import type { ResultadoMotor } from "@/lib/validation/motor";
import { rateLimit } from "@/lib/rate-limit";
import { emendaRascunhoSchema, parecerSchema } from "@/lib/validation/schemas";
import { TipoEmenda } from "@/generated/prisma/enums";

export type EmendaResult =
  | { ok: true; id?: string; resultado?: ResultadoMotor; message?: string }
  | { ok: false; error: string; resultado?: ResultadoMotor };

function audUser(id: string) {
  return id === "dev-user" ? null : id;
}

// Garante que a dotação pertence ao instrumento base (nunca confiar no cliente).
async function dotacaoDaBase(dotacaoId: string, instrumentoBaseId: string) {
  const d = await prisma.dotacao.findUnique({
    where: { id: dotacaoId },
    select: { id: true, instrumentoId: true },
  });
  return !!d && d.instrumentoId === instrumentoBaseId;
}

export async function criarRascunhoEmenda(input: unknown): Promise<EmendaResult> {
  const u = await getCurrentUser();
  if (!podeCriarEmenda(u)) return { ok: false, error: "Sem permissão para apresentar emendas." };

  const parsed = emendaRascunhoSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;

  const base = await prisma.instrumentoPlanejamento.findUnique({
    where: { id: d.instrumentoBaseId },
    select: { id: true, exercicioId: true, especie: true },
  });
  if (!base || base.especie !== "PROJETO_LEI")
    return { ok: false, error: "Instrumento base inválido." };

  if (!(await dotacaoDaBase(d.dotacaoId, d.instrumentoBaseId)))
    return { ok: false, error: "A dotação não pertence ao instrumento base." };

  if (d.tipo === TipoEmenda.REMANEJAMENTO) {
    const okOrigem = d.dotacaoOrigemId && (await dotacaoDaBase(d.dotacaoOrigemId, d.instrumentoBaseId));
    const okDestino = d.dotacaoDestinoId && (await dotacaoDaBase(d.dotacaoDestinoId, d.instrumentoBaseId));
    if (!okOrigem || !okDestino)
      return { ok: false, error: "Origem/destino do remanejamento não pertencem à base." };
  }

  const autor = await prisma.autor.findFirst({ where: { usuarioId: u.id } });
  if (!autor)
    return { ok: false, error: "Seu usuário não está vinculado a um autor. Peça ao administrador." };

  try {
    const n = await prisma.emenda.count({ where: { exercicioId: base.exercicioId } });
    const criada = await prisma.emenda.create({
      data: {
        numero: String(n + 1),
        exercicioId: base.exercicioId,
        instrumentoBaseId: base.id,
        autorId: autor.id,
        dotacaoId: d.dotacaoId,
        tipo: d.tipo as never,
        objeto: d.objeto,
        justificativa: d.justificativa,
        valor: d.valor,
        status: "RASCUNHO",
        dotacaoOrigemId: d.tipo === TipoEmenda.REMANEJAMENTO ? d.dotacaoOrigemId : null,
        dotacaoDestinoId: d.tipo === TipoEmenda.REMANEJAMENTO ? d.dotacaoDestinoId : null,
      },
    });
    await registrarAuditoria({
      usuarioId: audUser(u.id),
      entidade: "Emenda",
      entidadeId: criada.id,
      acao: "CRIAR_RASCUNHO",
      dadosDepois: { numero: criada.numero, valor: d.valor },
    });
    revalidatePath("/legislativo/emendas");
    return { ok: true, id: criada.id };
  } catch {
    return { ok: false, error: "Não foi possível salvar a emenda." };
  }
}

export async function atualizarEmenda(id: string, input: unknown): Promise<EmendaResult> {
  const u = await getCurrentUser();
  const emenda = await prisma.emenda.findUnique({
    where: { id },
    select: { status: true, instrumentoBaseId: true, autor: { select: { usuarioId: true } } },
  });
  if (!emenda) return { ok: false, error: "Emenda não encontrada." };
  if (!podeGerirEmenda(u, { autorUsuarioId: emenda.autor.usuarioId }))
    return { ok: false, error: "Sem permissão para editar esta emenda." };
  if (emenda.status !== "RASCUNHO" && emenda.status !== "INVALIDA")
    return { ok: false, error: "Apenas rascunhos ou emendas inválidas podem ser editadas." };

  const parsed = emendaRascunhoSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;

  if (!(await dotacaoDaBase(d.dotacaoId, d.instrumentoBaseId)))
    return { ok: false, error: "A dotação não pertence ao instrumento base." };

  try {
    await prisma.emenda.update({
      where: { id },
      data: {
        dotacaoId: d.dotacaoId,
        tipo: d.tipo as never,
        objeto: d.objeto,
        justificativa: d.justificativa,
        valor: d.valor,
        dotacaoOrigemId: d.tipo === TipoEmenda.REMANEJAMENTO ? d.dotacaoOrigemId : null,
        dotacaoDestinoId: d.tipo === TipoEmenda.REMANEJAMENTO ? d.dotacaoDestinoId : null,
        status: "RASCUNHO",
      },
    });
    await registrarAuditoria({
      usuarioId: audUser(u.id),
      entidade: "Emenda",
      entidadeId: id,
      acao: "ATUALIZAR",
    });
    revalidatePath("/legislativo/emendas");
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Não foi possível atualizar a emenda." };
  }
}

export async function validarEmendaAction(id: string): Promise<EmendaResult> {
  const u = await getCurrentUser();
  const emenda = await prisma.emenda.findUnique({
    where: { id },
    select: { autor: { select: { usuarioId: true } } },
  });
  if (!emenda) return { ok: false, error: "Emenda não encontrada." };
  if (!podeGerirEmenda(u, { autorUsuarioId: emenda.autor.usuarioId }))
    return { ok: false, error: "Sem permissão." };

  try {
    const resultado = await validarEmenda(id);
    await registrarAuditoria({
      usuarioId: audUser(u.id),
      entidade: "Emenda",
      entidadeId: id,
      acao: "VALIDAR",
      dadosDepois: { resultado: resultado.resultado },
    });
    revalidatePath("/legislativo/emendas");
    return { ok: true, id, resultado };
  } catch {
    return { ok: false, error: "Falha ao validar a emenda." };
  }
}

export async function submeterEmenda(id: string): Promise<EmendaResult> {
  const u = await getCurrentUser();
  const emenda = await prisma.emenda.findUnique({
    where: { id },
    select: { status: true, autor: { select: { usuarioId: true } } },
  });
  if (!emenda) return { ok: false, error: "Emenda não encontrada." };
  if (!podeGerirEmenda(u, { autorUsuarioId: emenda.autor.usuarioId }))
    return { ok: false, error: "Sem permissão." };
  if (!rateLimit(`submeter:${u.id}`, 20, 60_000))
    return { ok: false, error: "Muitas submissões em pouco tempo. Aguarde um instante." };

  // Revalida SEMPRE no servidor antes de submeter (não confia no cliente).
  let resultado: ResultadoMotor;
  try {
    resultado = await validarEmenda(id);
  } catch {
    return { ok: false, error: "Falha ao revalidar a emenda." };
  }
  if (resultado.resultado !== "VALIDA") {
    return {
      ok: false,
      error: "Emenda inválida — corrija os itens em falha antes de submeter.",
      resultado,
    };
  }

  try {
    await prisma.emenda.update({ where: { id }, data: { status: "SUBMETIDA" } });
    await registrarAuditoria({
      usuarioId: audUser(u.id),
      entidade: "Emenda",
      entidadeId: id,
      acao: "SUBMETER",
    });
    revalidatePath("/legislativo/emendas");
    return { ok: true, id, resultado };
  } catch {
    return { ok: false, error: "Não foi possível submeter a emenda." };
  }
}

async function decidirTramitacao(
  id: string,
  novoStatus: "APROVADA" | "REJEITADA",
  parecerInput: unknown
): Promise<EmendaResult> {
  const u = await getCurrentUser();
  if (!podeTramitar(u)) return { ok: false, error: "Sem permissão para tramitar emendas." };

  const parsed = parecerSchema.safeParse(parecerInput);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Parecer inválido." };

  const emenda = await prisma.emenda.findUnique({ where: { id }, select: { status: true } });
  if (!emenda) return { ok: false, error: "Emenda não encontrada." };
  if (emenda.status !== "SUBMETIDA")
    return { ok: false, error: "Apenas emendas submetidas podem ser tramitadas." };

  try {
    await prisma.emenda.update({ where: { id }, data: { status: novoStatus } });
    await registrarAuditoria({
      usuarioId: audUser(u.id),
      entidade: "Emenda",
      entidadeId: id,
      acao: novoStatus === "APROVADA" ? "APROVAR" : "REJEITAR",
      dadosDepois: { parecer: parsed.data.parecer },
    });
    revalidatePath("/legislativo/tramitacao");
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Não foi possível tramitar a emenda." };
  }
}

export async function aprovarEmenda(id: string, parecer: unknown) {
  return decidirTramitacao(id, "APROVADA", parecer);
}
export async function rejeitarEmenda(id: string, parecer: unknown) {
  return decidirTramitacao(id, "REJEITADA", parecer);
}
