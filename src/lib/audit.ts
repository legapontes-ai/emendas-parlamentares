import "server-only";
import { prisma } from "./prisma";

// Registra uma entrada de auditoria. Nunca lança: auditoria não pode derrubar a
// operação principal (mas falhas são logadas). A trilha completa é reforçada no
// PROMPT 10.
export async function registrarAuditoria(params: {
  usuarioId?: string | null;
  entidade: string;
  entidadeId: string;
  acao: string;
  dadosAntes?: unknown;
  dadosDepois?: unknown;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        usuarioId: params.usuarioId ?? null,
        entidade: params.entidade,
        entidadeId: params.entidadeId,
        acao: params.acao,
        dadosAntes: (params.dadosAntes ?? undefined) as never,
        dadosDepois: (params.dadosDepois ?? undefined) as never,
      },
    });
  } catch (e) {
    console.error("[audit] falha ao registrar auditoria:", e);
  }
}
