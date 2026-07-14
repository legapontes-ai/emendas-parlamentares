import { describe, expect, it } from "vitest";
import { agruparDuplicados, tokens } from "../beneficiarios-dedup";

describe("agruparDuplicados", () => {
  it("agrupa variante por word-prefix e escolhe o de mais emendas como destino", () => {
    const grupos = agruparDuplicados([
      { id: "a", nome: "Santa Casa", emendas: 12 },
      { id: "b", nome: "Santa Casa de Misericórdia", emendas: 3 },
      { id: "c", nome: "APAE", emendas: 5 },
    ]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].canonicalId).toBe("a"); // mais emendas
    expect(grupos[0].membros.map((m) => m.id).sort()).toEqual(["a", "b"]);
  });

  it("empate de emendas → nome mais específico (mais tokens) vira destino", () => {
    const grupos = agruparDuplicados([
      { id: "a", nome: "Santa Casa", emendas: 4 },
      { id: "b", nome: "Santa Casa de Misericórdia", emendas: 4 },
    ]);
    expect(grupos[0].canonicalId).toBe("b");
  });

  it("não agrupa entidades distintas que só compartilham o 1º token", () => {
    const grupos = agruparDuplicados([
      { id: "a", nome: "Associação Ágape", emendas: 2 },
      { id: "b", nome: "Associação Mais Vida", emendas: 1 },
    ]);
    expect(grupos).toHaveLength(0);
  });

  it("prefixo de 1 token não agrupa (evita termo genérico solto)", () => {
    const grupos = agruparDuplicados([
      { id: "a", nome: "Secretaria", emendas: 1 },
      { id: "b", nome: "Secretaria de Saúde", emendas: 8 },
    ]);
    expect(grupos).toHaveLength(0);
  });

  it("encadeia 3 variantes no mesmo grupo", () => {
    const grupos = agruparDuplicados([
      { id: "a", nome: "Hospital Tabajara", emendas: 1 },
      { id: "b", nome: "Hospital Tabajara Ramos", emendas: 6 },
      { id: "c", nome: "Hospital Tabajara Ramos - Fisioterapia", emendas: 2 },
    ]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].membros).toHaveLength(3);
    expect(grupos[0].canonicalId).toBe("b");
  });

  it("agrupa infixo inserido no meio (mesmo 1º token, folga ≤2)", () => {
    const grupos = agruparDuplicados([
      { id: "a", nome: "Hospital Tabajara Ramos", emendas: 9 },
      { id: "b", nome: "Hospital Municipal Tabajara Ramos", emendas: 4 },
    ]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].canonicalId).toBe("a");
  });

  it("não agrupa quando o 1º token difere", () => {
    const grupos = agruparDuplicados([
      { id: "a", nome: "Fundo Saúde", emendas: 1 },
      { id: "b", nome: "Secretaria Fundo Saúde", emendas: 1 },
    ]);
    expect(grupos).toHaveLength(0);
  });

  it("não agrupa quando a diferença passa de 2 tokens", () => {
    const grupos = agruparDuplicados([
      { id: "a", nome: "Centro Esportivo", emendas: 1 },
      { id: "b", nome: "Centro Esportivo Municipal da Vila Nova Antena", emendas: 1 },
    ]);
    expect(grupos).toHaveLength(0);
  });

  it("tokens normaliza acento e pontuação", () => {
    expect(tokens("Associação Ágape — Custeio")).toEqual([
      "associacao",
      "agape",
      "custeio",
    ]);
  });
});
