import * as XLSX from "xlsx";

// Lê um workbook (CSV/XLSX) e devolve as linhas das planilhas de dotações e de
// prioridades da LDO. Nomes de planilha aceitos são flexíveis; senão usa a 1ª.
export function planilhaParaLinhas(dados: Buffer | Uint8Array): {
  dotacoes: Record<string, unknown>[];
  prioridades: Record<string, unknown>[];
} {
  const wb = XLSX.read(dados, { type: "buffer" });
  return extrair(wb);
}

// Variante para testes: lê a partir de texto CSV.
export function csvParaLinhas(csv: string): Record<string, unknown>[] {
  const wb = XLSX.read(csv, { type: "string" });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    defval: "",
    raw: false,
  });
}

function extrair(wb: XLSX.WorkBook) {
  const achar = (alvos: string[]) =>
    wb.SheetNames.find((n) => alvos.includes(n.toLowerCase().trim()));

  const nomeDot =
    achar(["dotacoes", "dotações", "base", "dotacao"]) ?? wb.SheetNames[0];
  const nomePri = achar(["prioridades_ldo", "prioridades", "ldo"]);

  // raw:false lê valores formatados como texto — preserva códigos de colunas
  // formatadas como Texto no XLSX. Obs.: em CSV, zeros à esquerda de códigos
  // podem ser perdidos; recomende XLSX com colunas de código como Texto.
  const linhas = (nome?: string): Record<string, unknown>[] =>
    nome && wb.Sheets[nome]
      ? XLSX.utils.sheet_to_json(wb.Sheets[nome], { defval: "", raw: false })
      : [];

  return { dotacoes: linhas(nomeDot), prioridades: linhas(nomePri) };
}
