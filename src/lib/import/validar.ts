import { z } from "zod";
import { TipoAcao } from "@/generated/prisma/enums";
import type {
  DotacaoRow,
  ErroLinha,
  PrioridadeRow,
  ResultadoValidacao,
} from "./tipos";

// Campo de texto obrigatório, tolerante a números/nulos vindos da planilha.
function req(label: string) {
  return z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1, `${label} é obrigatório`)
  );
}

function opcional() {
  return z.preprocess(
    (v) => (v == null || String(v).trim() === "" ? null : String(v).trim()),
    z.string().nullable()
  );
}

const tiposAcao = Object.values(TipoAcao) as [string, ...string[]];

const acaoTipo = z.preprocess(
  (v) => String(v ?? "").trim().toUpperCase(),
  z.enum(tiposAcao, {
    message: `acao_tipo deve ser um de: ${tiposAcao.join(", ")}`,
  })
);

const valorInicial = z.preprocess((v) => {
  if (v == null || String(v).trim() === "") return NaN;
  return Number(String(v).replace(/\./g, "").replace(",", "."));
}, z.number({ message: "valor_inicial inválido" }).nonnegative("valor_inicial deve ser ≥ 0"));

// ------------------------------------------------------- Linha de dotação
const dotacaoLinhaSchema = z
  .object({
    orgao_codigo: req("orgao_codigo"),
    orgao_nome: req("orgao_nome"),
    unidade_codigo: req("unidade_codigo"),
    unidade_nome: req("unidade_nome"),
    funcao_codigo: req("funcao_codigo"),
    funcao_nome: req("funcao_nome"),
    subfuncao_codigo: req("subfuncao_codigo"),
    subfuncao_nome: req("subfuncao_nome"),
    programa_codigo: req("programa_codigo"),
    programa_nome: req("programa_nome"),
    acao_codigo: req("acao_codigo"),
    acao_nome: req("acao_nome"),
    acao_tipo: acaoTipo,
    natureza_codigo: req("natureza_codigo"),
    natureza_categoria: req("natureza_categoria"),
    natureza_grupo: req("natureza_grupo"),
    natureza_modalidade: req("natureza_modalidade"),
    natureza_elemento: req("natureza_elemento"),
    fonte_codigo: req("fonte_codigo"),
    fonte_nome: req("fonte_nome"),
    valor_inicial: valorInicial,
  })
  .transform(
    (r): DotacaoRow => ({
      orgaoCodigo: r.orgao_codigo,
      orgaoNome: r.orgao_nome,
      unidadeCodigo: r.unidade_codigo,
      unidadeNome: r.unidade_nome,
      funcaoCodigo: r.funcao_codigo,
      funcaoNome: r.funcao_nome,
      subfuncaoCodigo: r.subfuncao_codigo,
      subfuncaoNome: r.subfuncao_nome,
      programaCodigo: r.programa_codigo,
      programaNome: r.programa_nome,
      acaoCodigo: r.acao_codigo,
      acaoNome: r.acao_nome,
      acaoTipo: r.acao_tipo,
      naturezaCodigo: r.natureza_codigo,
      naturezaCategoria: r.natureza_categoria,
      naturezaGrupo: r.natureza_grupo,
      naturezaModalidade: r.natureza_modalidade,
      naturezaElemento: r.natureza_elemento,
      fonteCodigo: r.fonte_codigo,
      fonteNome: r.fonte_nome,
      valorInicial: r.valor_inicial,
    })
  );

// ---------------------------------------------------- Linha de prioridade LDO
const prioridadeLinhaSchema = z
  .object({
    programa_codigo: req("programa_codigo"),
    acao_codigo: opcional(),
    descricao: req("descricao"),
  })
  .transform(
    (r): PrioridadeRow => ({
      programaCodigo: r.programa_codigo,
      acaoCodigo: r.acao_codigo,
      descricao: r.descricao,
    })
  );

function mensagem(err: z.ZodError): string {
  const i = err.issues[0];
  if (!i) return "linha inválida";
  const campo = i.path.length ? `${i.path.join(".")}: ` : "";
  return `${campo}${i.message}`;
}

// Valida linhas de dotação. Rejeita classificação incompleta com linha + motivo.
export function validarDotacoes(
  rows: Record<string, unknown>[]
): ResultadoValidacao<DotacaoRow> {
  const validas: DotacaoRow[] = [];
  const erros: ErroLinha[] = [];
  rows.forEach((row, i) => {
    const parsed = dotacaoLinhaSchema.safeParse(row);
    if (parsed.success) validas.push(parsed.data);
    else erros.push({ linha: i + 2, motivo: mensagem(parsed.error) });
  });
  return { validas, erros };
}

export function validarPrioridades(
  rows: Record<string, unknown>[]
): ResultadoValidacao<PrioridadeRow> {
  const validas: PrioridadeRow[] = [];
  const erros: ErroLinha[] = [];
  rows.forEach((row, i) => {
    const parsed = prioridadeLinhaSchema.safeParse(row);
    if (parsed.success) validas.push(parsed.data);
    else erros.push({ linha: i + 2, motivo: mensagem(parsed.error) });
  });
  return { validas, erros };
}
