"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { registrarAuditoria } from "@/lib/audit";
import {
  instrumentoPLSchema,
  leiAprovadaSchema,
  normaSchema,
  parametroSchema,
  usuarioSchema,
  ESPECIE_BASE,
} from "@/lib/validation/schemas";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

// Gate de papel para ações de configuração (não redireciona — retorna erro).
async function exigirPapel(...roles: Role[]) {
  const user = await getCurrentUser();
  if (user.role !== Role.SUPER_ADMIN && !roles.includes(user.role)) {
    return { erro: "Você não tem permissão para esta ação." as const, user: null };
  }
  return { erro: null, user };
}

function primeiraMensagem(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Dados inválidos.";
}

function audUser(id: string): string | null {
  // Sessão de dev não é um User real; evita ruído de FK na auditoria (PROMPT 9
  // liga a auditoria ao usuário autenticado de verdade).
  return id === "dev-user" ? null : id;
}

// ============================================================ PARÂMETROS
export async function criarParametro(input: unknown): Promise<ActionResult> {
  const gate = await exigirPapel(Role.EXEC_ADMIN, Role.LEG_ADMIN);
  if (gate.erro) return { ok: false, error: gate.erro };

  const parsed = parametroSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: primeiraMensagem(parsed.error) };
  const d = parsed.data;

  try {
    const criado = await prisma.parametroValidacao.create({
      data: {
        escopo: d.escopo as never,
        exercicioId: d.escopo === "EXERCICIO" ? d.exercicioId : null,
        chave: d.chave,
        valor: d.valor,
        modo: (d.modo ?? null) as never,
        fundamentoNormaId: d.fundamentoNormaId,
        fundamentoDescricao: d.fundamentoDescricao,
      },
    });
    await registrarAuditoria({
      usuarioId: audUser(gate.user.id),
      entidade: "ParametroValidacao",
      entidadeId: criado.id,
      acao: "CRIAR",
      dadosDepois: criado,
    });
    revalidatePath("/config");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Não foi possível salvar o parâmetro." };
  }
}

export async function excluirParametro(id: string): Promise<ActionResult> {
  const gate = await exigirPapel(Role.EXEC_ADMIN, Role.LEG_ADMIN);
  if (gate.erro) return { ok: false, error: gate.erro };
  try {
    await prisma.parametroValidacao.delete({ where: { id } });
    await registrarAuditoria({
      usuarioId: audUser(gate.user.id),
      entidade: "ParametroValidacao",
      entidadeId: id,
      acao: "EXCLUIR",
    });
    revalidatePath("/config");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível excluir o parâmetro." };
  }
}

// ================================================================ NORMAS
export async function criarNorma(input: unknown): Promise<ActionResult> {
  const gate = await exigirPapel(Role.EXEC_ADMIN, Role.LEG_ADMIN);
  if (gate.erro) return { ok: false, error: gate.erro };

  const parsed = normaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: primeiraMensagem(parsed.error) };
  const d = parsed.data;

  try {
    const criado = await prisma.documentoNormativo.create({
      data: {
        tipo: d.tipo as never,
        titulo: d.titulo,
        numero: d.numero,
        arquivoUrl: d.arquivoUrl,
        dataVigencia: d.dataVigencia ? new Date(d.dataVigencia) : null,
        ativo: d.ativo,
      },
    });
    await registrarAuditoria({
      usuarioId: audUser(gate.user.id),
      entidade: "DocumentoNormativo",
      entidadeId: criado.id,
      acao: "CRIAR",
      dadosDepois: criado,
    });
    revalidatePath("/config");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível salvar o documento." };
  }
}

export async function alternarNormaAtiva(id: string): Promise<ActionResult> {
  const gate = await exigirPapel(Role.EXEC_ADMIN, Role.LEG_ADMIN);
  if (gate.erro) return { ok: false, error: gate.erro };
  try {
    const atual = await prisma.documentoNormativo.findUnique({ where: { id } });
    if (!atual) return { ok: false, error: "Documento não encontrado." };
    await prisma.documentoNormativo.update({
      where: { id },
      data: { ativo: !atual.ativo },
    });
    revalidatePath("/config");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível atualizar o documento." };
  }
}

// ========================================================== INSTRUMENTOS
export async function criarInstrumentoPL(input: unknown): Promise<ActionResult> {
  const gate = await exigirPapel(Role.EXEC_ADMIN, Role.EXEC_PLANEJAMENTO);
  if (gate.erro) return { ok: false, error: gate.erro };

  const parsed = instrumentoPLSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: primeiraMensagem(parsed.error) };
  const d = parsed.data;

  try {
    const criado = await prisma.instrumentoPlanejamento.create({
      data: {
        tipo: d.tipo as never,
        especie: ESPECIE_BASE as never,
        numero: d.numero,
        ementa: d.ementa,
        exercicioId: d.exercicioId,
        status: "EM_TRAMITACAO" as never,
        arquivoUrl: d.arquivoUrl,
        dataEnvio: d.dataEnvio ? new Date(d.dataEnvio) : null,
      },
    });
    await registrarAuditoria({
      usuarioId: audUser(gate.user.id),
      entidade: "InstrumentoPlanejamento",
      entidadeId: criado.id,
      acao: "CRIAR_PL",
      dadosDepois: criado,
    });
    revalidatePath("/config");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível criar o projeto de lei." };
  }
}

export async function subirLeiAprovada(input: unknown): Promise<ActionResult> {
  const gate = await exigirPapel(Role.EXEC_ADMIN, Role.EXEC_PLANEJAMENTO);
  if (gate.erro) return { ok: false, error: gate.erro };

  const parsed = leiAprovadaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: primeiraMensagem(parsed.error) };
  const d = parsed.data;

  try {
    const origem = await prisma.instrumentoPlanejamento.findUnique({
      where: { id: d.instrumentoOrigemId },
    });
    if (!origem) return { ok: false, error: "Projeto de lei de origem não encontrado." };

    const criado = await prisma.instrumentoPlanejamento.create({
      data: {
        tipo: origem.tipo,
        especie: "LEI_APROVADA" as never,
        numero: d.numero,
        ementa: d.ementa,
        exercicioId: origem.exercicioId,
        status: d.status as never,
        arquivoUrl: d.arquivoUrl,
        dataAprovacao: d.dataAprovacao ? new Date(d.dataAprovacao) : null,
        dataVigencia: d.dataVigencia ? new Date(d.dataVigencia) : null,
        instrumentoOrigemId: origem.id,
      },
    });
    await registrarAuditoria({
      usuarioId: audUser(gate.user.id),
      entidade: "InstrumentoPlanejamento",
      entidadeId: criado.id,
      acao: "SUBIR_LEI_APROVADA",
      dadosDepois: criado,
    });
    revalidatePath("/config");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível subir a lei aprovada." };
  }
}

// Geração da base estruturada — implementada no PROMPT 4 (importação).
export async function gerarBase(_instrumentoId: string): Promise<ActionResult> {
  await exigirPapel(Role.EXEC_ADMIN, Role.EXEC_PLANEJAMENTO);
  return {
    ok: false,
    error: "A geração da base de dotações será habilitada no PROMPT 4 (importação).",
  };
}

// ============================================================== USUÁRIOS
export async function criarUsuario(input: unknown): Promise<ActionResult> {
  const gate = await exigirPapel(Role.EXEC_ADMIN, Role.LEG_ADMIN);
  if (gate.erro) return { ok: false, error: gate.erro };

  const parsed = usuarioSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: primeiraMensagem(parsed.error) };
  const d = parsed.data;

  try {
    const criado = await prisma.user.create({
      data: {
        name: d.nome,
        email: d.email,
        poder: (d.poder ?? null) as never,
        role: d.role as never,
      },
    });
    await registrarAuditoria({
      usuarioId: audUser(gate.user.id),
      entidade: "User",
      entidadeId: criado.id,
      acao: "CRIAR",
      dadosDepois: { id: criado.id, email: criado.email, role: criado.role },
    });
    revalidatePath("/config");
    return { ok: true };
  } catch (e) {
    const msg =
      e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002"
        ? "Já existe um usuário com este e-mail."
        : "Não foi possível criar o usuário.";
    return { ok: false, error: msg };
  }
}
