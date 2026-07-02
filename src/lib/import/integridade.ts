import type { Componentes, DotacaoRow, ErroLinha } from "./tipos";
import { chaveAcao, chaveSubfuncao, chaveUnidade } from "./derivar";

// Só é possível importar uma dotação se TODOS os seus componentes existirem
// (no conjunto derivado da planilha e/ou já presentes no exercício).
export function checarIntegridade(
  dotacoes: DotacaoRow[],
  comp: Componentes
): ErroLinha[] {
  const erros: ErroLinha[] = [];

  dotacoes.forEach((d, i) => {
    const faltando: string[] = [];
    if (!comp.orgaos.has(d.orgaoCodigo)) faltando.push(`órgão ${d.orgaoCodigo}`);
    if (!comp.unidades.has(chaveUnidade(d.orgaoCodigo, d.unidadeCodigo)))
      faltando.push(`unidade ${d.unidadeCodigo}`);
    if (!comp.funcoes.has(d.funcaoCodigo))
      faltando.push(`função ${d.funcaoCodigo}`);
    if (!comp.subfuncoes.has(chaveSubfuncao(d.funcaoCodigo, d.subfuncaoCodigo)))
      faltando.push(`subfunção ${d.subfuncaoCodigo}`);
    if (!comp.programas.has(d.programaCodigo))
      faltando.push(`programa ${d.programaCodigo}`);
    if (!comp.acoes.has(chaveAcao(d.programaCodigo, d.acaoCodigo)))
      faltando.push(`ação ${d.acaoCodigo}`);
    if (!comp.naturezas.has(d.naturezaCodigo))
      faltando.push(`natureza ${d.naturezaCodigo}`);
    if (!comp.fontes.has(d.fonteCodigo))
      faltando.push(`fonte ${d.fonteCodigo}`);

    if (faltando.length > 0) {
      erros.push({
        linha: i + 2,
        motivo: `componentes inexistentes: ${faltando.join(", ")}`,
      });
    }
  });

  return erros;
}
