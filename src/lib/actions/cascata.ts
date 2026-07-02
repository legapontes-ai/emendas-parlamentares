"use server";

// Actions de leitura para a cascata dependente da Nova Emenda. Sempre restritas
// ao instrumento base. (Gate de leitura por sessão será reforçado no PROMPT 9.)
import {
  listarAcoesBase,
  listarDotacoesBase,
  listarOrgaosBase,
  listarProgramasBase,
  listarUnidadesBase,
  type DotacaoOpcao,
} from "@/lib/queries-orcamento";

export async function fetchOrgaos(baseId: string) {
  return listarOrgaosBase(baseId);
}

export async function fetchUnidades(baseId: string, orgaoId: string) {
  return listarUnidadesBase(baseId, orgaoId);
}

export async function fetchProgramas(
  baseId: string,
  orgaoId: string,
  unidadeId: string
) {
  return listarProgramasBase(baseId, { orgaoId, unidadeId });
}

export async function fetchAcoes(
  baseId: string,
  programaId: string,
  orgaoId: string,
  unidadeId: string
) {
  return listarAcoesBase(baseId, programaId, { orgaoId, unidadeId });
}

export async function fetchDotacoes(f: {
  instrumentoId: string;
  orgaoId?: string;
  unidadeId?: string;
  programaId?: string;
  acaoId?: string;
}): Promise<DotacaoOpcao[]> {
  return listarDotacoesBase(f);
}

// Todas as dotações da base (para origem/destino de remanejamento).
export async function fetchTodasDotacoes(baseId: string): Promise<DotacaoOpcao[]> {
  return listarDotacoesBase({ instrumentoId: baseId });
}
