import type { Componentes, DotacaoRow } from "./tipos";

// Chaves compostas espelham os índices únicos do schema (UO por órgão,
// subfunção por função, ação por programa).
export const chaveUnidade = (orgaoCodigo: string, unidadeCodigo: string) =>
  `${orgaoCodigo}::${unidadeCodigo}`;
export const chaveSubfuncao = (funcaoCodigo: string, subfuncaoCodigo: string) =>
  `${funcaoCodigo}::${subfuncaoCodigo}`;
export const chaveAcao = (programaCodigo: string, acaoCodigo: string) =>
  `${programaCodigo}::${acaoCodigo}`;

// Deriva os componentes únicos a partir das linhas de dotação válidas.
export function derivarComponentes(dotacoes: DotacaoRow[]): Componentes {
  const c: Componentes = {
    orgaos: new Map(),
    unidades: new Map(),
    funcoes: new Map(),
    subfuncoes: new Map(),
    programas: new Map(),
    acoes: new Map(),
    naturezas: new Map(),
    fontes: new Map(),
  };

  for (const d of dotacoes) {
    c.orgaos.set(d.orgaoCodigo, { codigo: d.orgaoCodigo, nome: d.orgaoNome });
    c.unidades.set(chaveUnidade(d.orgaoCodigo, d.unidadeCodigo), {
      codigo: d.unidadeCodigo,
      nome: d.unidadeNome,
      orgaoCodigo: d.orgaoCodigo,
    });
    c.funcoes.set(d.funcaoCodigo, { codigo: d.funcaoCodigo, nome: d.funcaoNome });
    c.subfuncoes.set(chaveSubfuncao(d.funcaoCodigo, d.subfuncaoCodigo), {
      codigo: d.subfuncaoCodigo,
      nome: d.subfuncaoNome,
      funcaoCodigo: d.funcaoCodigo,
    });
    c.programas.set(d.programaCodigo, {
      codigo: d.programaCodigo,
      nome: d.programaNome,
    });
    c.acoes.set(chaveAcao(d.programaCodigo, d.acaoCodigo), {
      codigo: d.acaoCodigo,
      nome: d.acaoNome,
      tipo: d.acaoTipo,
      programaCodigo: d.programaCodigo,
    });
    c.naturezas.set(d.naturezaCodigo, {
      codigo: d.naturezaCodigo,
      categoriaEconomica: d.naturezaCategoria,
      grupo: d.naturezaGrupo,
      modalidadeAplicacao: d.naturezaModalidade,
      elemento: d.naturezaElemento,
    });
    c.fontes.set(d.fonteCodigo, { codigo: d.fonteCodigo, nome: d.fonteNome });
  }

  return c;
}
