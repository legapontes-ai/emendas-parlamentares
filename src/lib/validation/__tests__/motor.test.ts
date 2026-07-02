import { describe, expect, it } from "vitest";
import { avaliarEmenda, type ContextoEmenda } from "../motor";

function ctxValido(over: Partial<ContextoEmenda> = {}): ContextoEmenda {
  const base: ContextoEmenda = {
    emenda: {
      tipo: "ACRESCIMO",
      valor: 1000,
      exercicioId: "ex1",
      instrumentoBaseId: "pl1",
      autorId: "a1",
    },
    exercicioStatus: "ABERTO",
    instrumentoBaseStatus: "EM_TRAMITACAO",
    dotacao: {
      id: "d1",
      instrumentoId: "pl1",
      exercicioId: "ex1",
      orgaoId: "o1",
      unidadeOrcamentariaId: "u1",
      funcaoId: "f1",
      subfuncaoId: "sf1",
      programaId: "prog1",
      acaoId: "acao1",
      naturezaDespesaId: "n1",
      fonteRecursoId: "fr1",
      valorAtual: 5000,
      acaoProgramaId: "prog1",
    },
    dotacaoOrigem: null,
    dotacaoDestino: null,
    ppaCadastrado: true,
    programasNoPPA: new Set(["prog1"]),
    prioridadesPrograma: new Set(["prog1"]),
    prioridadesAcao: new Set(),
    modoAderenciaLDO: "ALERTA",
    tetoValorAutor: null,
    somaAutorExistente: 0,
  };
  return { ...base, ...over };
}

const item = (r: ReturnType<typeof avaliarEmenda>, codigo: string) =>
  r.itens.find((i) => i.codigo === codigo)!;

describe("avaliarEmenda", () => {
  it("caminho feliz → VÁLIDA sem falhas", () => {
    const r = avaliarEmenda(ctxValido());
    expect(r.resultado).toBe("VALIDA");
    expect(r.itens.some((i) => i.status === "FALHA")).toBe(false);
    expect(item(r, "EXERCICIO_ABERTO").status).toBe("OK");
  });

  it("dotação de outro instrumento → INVÁLIDA (DOTACAO_EXISTE)", () => {
    const r = avaliarEmenda(
      ctxValido({
        dotacao: { ...ctxValido().dotacao!, instrumentoId: "outro-pl" },
      })
    );
    expect(item(r, "DOTACAO_EXISTE").status).toBe("FALHA");
    expect(r.resultado).toBe("INVALIDA");
  });

  it("dotação de outro exercício → INVÁLIDA", () => {
    const r = avaliarEmenda(
      ctxValido({ dotacao: { ...ctxValido().dotacao!, exercicioId: "ex2" } })
    );
    expect(item(r, "DOTACAO_EXISTE").status).toBe("FALHA");
    expect(r.resultado).toBe("INVALIDA");
  });

  it("ação de programa errado → INVÁLIDA (ACAO_VINCULADA)", () => {
    const r = avaliarEmenda(
      ctxValido({ dotacao: { ...ctxValido().dotacao!, acaoProgramaId: "progX" } })
    );
    expect(item(r, "ACAO_VINCULADA").status).toBe("FALHA");
    expect(r.resultado).toBe("INVALIDA");
  });

  it("teto estourado → INVÁLIDA; dentro do teto → VÁLIDA", () => {
    const estoura = avaliarEmenda(
      ctxValido({ tetoValorAutor: 500, somaAutorExistente: 400, emenda: { ...ctxValido().emenda, valor: 200 } })
    );
    expect(item(estoura, "LIMITE_VALOR_AUTOR").status).toBe("FALHA");
    expect(estoura.resultado).toBe("INVALIDA");

    const dentro = avaliarEmenda(
      ctxValido({ tetoValorAutor: 500, somaAutorExistente: 100, emenda: { ...ctxValido().emenda, valor: 200 } })
    );
    expect(item(dentro, "LIMITE_VALOR_AUTOR").status).toBe("OK");
    expect(dentro.resultado).toBe("VALIDA");
  });

  it("LDO sem aderência: ALERTA não bloqueia; BLOQUEANTE bloqueia", () => {
    const semPrioridade = {
      prioridadesPrograma: new Set<string>(),
      prioridadesAcao: new Set<string>(),
    };
    const alerta = avaliarEmenda(ctxValido({ ...semPrioridade, modoAderenciaLDO: "ALERTA" }));
    expect(item(alerta, "ADERENCIA_LDO").status).toBe("ALERTA");
    expect(alerta.resultado).toBe("VALIDA");

    const bloqueante = avaliarEmenda(ctxValido({ ...semPrioridade, modoAderenciaLDO: "BLOQUEANTE" }));
    expect(item(bloqueante, "ADERENCIA_LDO").status).toBe("FALHA");
    expect(bloqueante.resultado).toBe("INVALIDA");
  });

  it("instrumento base fechado → INVÁLIDA", () => {
    const r = avaliarEmenda(ctxValido({ instrumentoBaseStatus: "APROVADO" }));
    expect(item(r, "INSTRUMENTO_BASE_ABERTO").status).toBe("FALHA");
    expect(r.resultado).toBe("INVALIDA");
  });

  it("remanejamento sem origem/destino → INVÁLIDA", () => {
    const r = avaliarEmenda(
      ctxValido({ emenda: { ...ctxValido().emenda, tipo: "REMANEJAMENTO" } })
    );
    expect(item(r, "TIPO_COERENTE").status).toBe("FALHA");
    expect(r.resultado).toBe("INVALIDA");
  });

  it("anulação acima do saldo da dotação → INVÁLIDA", () => {
    const r = avaliarEmenda(
      ctxValido({
        emenda: { ...ctxValido().emenda, tipo: "ANULACAO", valor: 999999 },
      })
    );
    expect(item(r, "TIPO_COERENTE").status).toBe("FALHA");
    expect(r.resultado).toBe("INVALIDA");
  });

  it("PPA não cadastrado → ALERTA (não bloqueia)", () => {
    const r = avaliarEmenda(
      ctxValido({ ppaCadastrado: false, programasNoPPA: new Set() })
    );
    expect(item(r, "PROGRAMA_NO_PPA").status).toBe("ALERTA");
    expect(r.resultado).toBe("VALIDA");
  });
});
