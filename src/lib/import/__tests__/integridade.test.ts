import { describe, expect, it } from "vitest";
import { validarDotacoes } from "../validar";
import { derivarComponentes } from "../derivar";
import { checarIntegridade } from "../integridade";
import type { DotacaoRow } from "../tipos";

function linha(over: Record<string, unknown> = {}) {
  return {
    orgao_codigo: "02", orgao_nome: "Prefeitura",
    unidade_codigo: "02.01", unidade_nome: "Gabinete",
    funcao_codigo: "04", funcao_nome: "Administração",
    subfuncao_codigo: "122", subfuncao_nome: "Adm Geral",
    programa_codigo: "0001", programa_nome: "Gestão",
    acao_codigo: "2001", acao_nome: "Manutenção", acao_tipo: "ATIVIDADE",
    natureza_codigo: "3.3.90.30", natureza_categoria: "3", natureza_grupo: "3",
    natureza_modalidade: "90", natureza_elemento: "30",
    fonte_codigo: "500", fonte_nome: "Ordinários",
    valor_inicial: "1000", ...over,
  };
}

describe("checarIntegridade", () => {
  it("não acusa erro quando todos os componentes existem", () => {
    const { validas } = validarDotacoes([linha()]);
    const comp = derivarComponentes(validas);
    expect(checarIntegridade(validas, comp)).toHaveLength(0);
  });

  it("acusa componente inexistente (programa fora do conjunto)", () => {
    const { validas } = validarDotacoes([linha()]);
    const comp = derivarComponentes(validas);

    const orfa: DotacaoRow = {
      ...validas[0],
      programaCodigo: "9999", // programa que não existe no conjunto
      acaoCodigo: "2001",
    };
    const erros = checarIntegridade([orfa], comp);
    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toContain("programa 9999");
    expect(erros[0].motivo).toContain("ação 2001");
  });
});
