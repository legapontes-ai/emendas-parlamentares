import { describe, expect, it } from "vitest";
import { validarDotacoes, validarPrioridades } from "../validar";

function linhaValida(over: Record<string, unknown> = {}) {
  return {
    orgao_codigo: "02",
    orgao_nome: "Prefeitura",
    unidade_codigo: "02.01",
    unidade_nome: "Gabinete",
    funcao_codigo: "04",
    funcao_nome: "Administração",
    subfuncao_codigo: "122",
    subfuncao_nome: "Administração Geral",
    programa_codigo: "0001",
    programa_nome: "Gestão Administrativa",
    acao_codigo: "2001",
    acao_nome: "Manutenção da Gestão",
    acao_tipo: "ATIVIDADE",
    natureza_codigo: "3.3.90.30",
    natureza_categoria: "3",
    natureza_grupo: "3",
    natureza_modalidade: "90",
    natureza_elemento: "30",
    fonte_codigo: "500",
    fonte_nome: "Recursos Ordinários",
    valor_inicial: "150000,50",
    ...over,
  };
}

describe("validarDotacoes", () => {
  it("aceita uma linha completa e converte o valor (vírgula decimal)", () => {
    const { validas, erros } = validarDotacoes([linhaValida()]);
    expect(erros).toHaveLength(0);
    expect(validas).toHaveLength(1);
    expect(validas[0].valorInicial).toBe(150000.5);
    expect(validas[0].acaoTipo).toBe("ATIVIDADE");
  });

  it("rejeita classificação incompleta com linha e motivo claros", () => {
    const { validas, erros } = validarDotacoes([
      linhaValida({ programa_codigo: "" }),
    ]);
    expect(validas).toHaveLength(0);
    expect(erros).toHaveLength(1);
    expect(erros[0].linha).toBe(2);
    expect(erros[0].motivo).toContain("programa_codigo");
  });

  it("rejeita tipo de ação inválido", () => {
    const { erros } = validarDotacoes([linhaValida({ acao_tipo: "XPTO" })]);
    expect(erros[0]?.motivo).toContain("acao_tipo");
  });

  it("rejeita valor negativo", () => {
    const { erros } = validarDotacoes([linhaValida({ valor_inicial: "-1" })]);
    expect(erros[0]?.motivo).toContain("valor_inicial");
  });

  it("normaliza acao_tipo em minúsculas", () => {
    const { validas } = validarDotacoes([linhaValida({ acao_tipo: "projeto" })]);
    expect(validas[0].acaoTipo).toBe("PROJETO");
  });
});

describe("validarPrioridades", () => {
  it("aceita prioridade com ação opcional ausente", () => {
    const { validas, erros } = validarPrioridades([
      { programa_codigo: "0001", acao_codigo: "", descricao: "Prioridade X" },
    ]);
    expect(erros).toHaveLength(0);
    expect(validas[0]).toEqual({
      programaCodigo: "0001",
      acaoCodigo: null,
      descricao: "Prioridade X",
    });
  });

  it("rejeita prioridade sem descrição", () => {
    const { erros } = validarPrioridades([
      { programa_codigo: "0001", acao_codigo: "2001", descricao: "" },
    ]);
    expect(erros[0]?.motivo).toContain("descricao");
  });
});
