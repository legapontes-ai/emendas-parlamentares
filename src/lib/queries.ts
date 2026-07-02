import "server-only";
import { prisma } from "./prisma";

// Executa uma leitura degradando para um fallback quando o banco está
// indisponível/não migrado (mantém a UI utilizável — ver PROMPT 2).
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// ------------------------------------------------------------------ Parâmetros
export async function listarParametros() {
  return safe(
    () =>
      prisma.parametroValidacao.findMany({
        include: {
          exercicio: { select: { ano: true } },
          fundamentoNorma: { select: { titulo: true } },
        },
        orderBy: [{ escopo: "asc" }, { chave: "asc" }],
      }),
    []
  );
}

// --------------------------------------------------------------------- Normas
export async function listarNormas() {
  return safe(
    () =>
      prisma.documentoNormativo.findMany({
        orderBy: [{ ativo: "desc" }, { createdAt: "desc" }],
      }),
    []
  );
}

export async function listarNormasAtivas() {
  return safe(
    () =>
      prisma.documentoNormativo.findMany({
        where: { ativo: true },
        select: { id: true, titulo: true, tipo: true },
        orderBy: { titulo: "asc" },
      }),
    [] as { id: string; titulo: string; tipo: string }[]
  );
}

// ---------------------------------------------------------------- Instrumentos
export async function listarInstrumentos() {
  return safe(
    () =>
      prisma.instrumentoPlanejamento.findMany({
        include: {
          exercicio: { select: { ano: true } },
          instrumentoOrigem: { select: { numero: true, tipo: true } },
          _count: { select: { dotacoes: true, emendas: true } },
        },
        orderBy: [{ createdAt: "desc" }],
      }),
    []
  );
}

// Projetos de lei disponíveis como origem de uma lei aprovada.
export async function listarProjetosDeLei() {
  return safe(
    () =>
      prisma.instrumentoPlanejamento.findMany({
        where: { especie: "PROJETO_LEI" },
        include: { exercicio: { select: { ano: true } } },
        orderBy: [{ createdAt: "desc" }],
      }),
    []
  );
}

// ------------------------------------------------------------------ Auditoria
export async function listarAuditoria(filtros: { entidade?: string } = {}) {
  return safe(
    () =>
      prisma.auditLog.findMany({
        where: { entidade: filtros.entidade || undefined },
        include: { usuario: { select: { name: true, email: true } } },
        orderBy: { criadoEm: "desc" },
        take: 200,
      }),
    []
  );
}

// ------------------------------------------------------------------- Usuários
export async function listarUsuarios() {
  return safe(
    () =>
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          poder: true,
          role: true,
          autor: { select: { id: true, nome: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    []
  );
}
