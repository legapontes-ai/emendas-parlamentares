import { z } from "zod";
import {
  EscopoParametro,
  EspecieInstrumento,
  ModoValidacao,
  Poder,
  Role,
  StatusInstrumento,
  TipoEmenda,
  TipoInstrumento,
  TipoNorma,
} from "@/generated/prisma/enums";

// Helper: transforma um enum-objeto do Prisma em tupla para z.enum (compatível
// entre versões do zod, sem depender de nativeEnum).
function valores<T extends Record<string, string>>(e: T): [string, ...string[]] {
  return Object.values(e) as [string, ...string[]];
}

// Enum opcional que aceita "" (select nativo vazio) como ausência.
function enumOpcional<T extends Record<string, string>>(e: T) {
  return z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.enum(valores(e)).optional()
  );
}

const textoOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const dataOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

// ---------------------------------------------------------------- Parâmetros
export const parametroSchema = z
  .object({
    escopo: z.enum(valores(EscopoParametro)),
    exercicioId: textoOpcional,
    chave: z.string().trim().min(1, "Informe a chave."),
    valor: z.string().trim().min(1, "Informe o valor."),
    modo: enumOpcional(ModoValidacao),
    fundamentoNormaId: textoOpcional,
    fundamentoDescricao: textoOpcional,
  })
  .refine(
    (d) => d.escopo !== EscopoParametro.EXERCICIO || !!d.exercicioId,
    { message: "Escopo por exercício exige selecionar o exercício.", path: ["exercicioId"] }
  );

export type ParametroInput = z.input<typeof parametroSchema>;

// ------------------------------------------------------------- Documento normativo
export const normaSchema = z.object({
  tipo: z.enum(valores(TipoNorma)),
  titulo: z.string().trim().min(1, "Informe o título."),
  numero: textoOpcional,
  arquivoUrl: z.string().trim().url("Informe uma URL válida do PDF."),
  dataVigencia: dataOpcional,
  ativo: z.boolean().default(true),
});

export type NormaInput = z.input<typeof normaSchema>;

// ------------------------------------------------- Instrumento: Projeto de Lei
export const instrumentoPLSchema = z.object({
  tipo: z.enum(valores(TipoInstrumento)),
  numero: z.string().trim().min(1, "Informe o número."),
  ementa: z.string().trim().min(1, "Informe a ementa."),
  exercicioId: z.string().trim().min(1, "Selecione o exercício."),
  arquivoUrl: z
    .string()
    .trim()
    .url("URL inválida.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  dataEnvio: dataOpcional,
});

export type InstrumentoPLInput = z.input<typeof instrumentoPLSchema>;

// ------------------------------------------------- Instrumento: Lei aprovada
export const leiAprovadaSchema = z.object({
  instrumentoOrigemId: z.string().trim().min(1, "Selecione o projeto de lei de origem."),
  numero: z.string().trim().min(1, "Informe o número."),
  ementa: z.string().trim().min(1, "Informe a ementa."),
  arquivoUrl: z
    .string()
    .trim()
    .url("URL inválida.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  status: z.enum(valores(StatusInstrumento)).default(StatusInstrumento.SANCIONADO),
  dataAprovacao: dataOpcional,
  dataVigencia: dataOpcional,
});

export type LeiAprovadaInput = z.input<typeof leiAprovadaSchema>;

// ----------------------------------------------------------------- Usuários
export const usuarioSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("E-mail inválido."),
  poder: enumOpcional(Poder),
  role: z.enum(valores(Role)),
  // Senha opcional (mín. 8). Se ausente, o usuário fica sem credencial até definir.
  senha: z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type UsuarioInput = z.input<typeof usuarioSchema>;

// Espécie usada ao criar instrumento base (sempre PROJETO_LEI na aba 3).
export const ESPECIE_BASE = EspecieInstrumento.PROJETO_LEI;

// ------------------------------------------------------------------ Emendas
// Valor monetário tolerante a "1.234,56" / "1234.56" / número.
const valorMonetario = z.preprocess((v) => {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim();
  if (!s) return NaN;
  return Number(s.replace(/\./g, "").replace(",", "."));
}, z.number({ message: "Valor inválido." }).positive("O valor deve ser maior que zero."));

export const emendaRascunhoSchema = z
  .object({
    instrumentoBaseId: z.string().trim().min(1, "Selecione o projeto de lei base."),
    dotacaoId: z.string().trim().min(1, "Selecione a dotação."),
    tipo: z.enum(valores(TipoEmenda)),
    objeto: z.string().trim().min(1, "Descreva o objeto."),
    justificativa: z.string().trim().min(1, "Informe a justificativa."),
    valor: valorMonetario,
    dotacaoOrigemId: textoOpcional,
    dotacaoDestinoId: textoOpcional,
  })
  .refine(
    (d) =>
      d.tipo !== TipoEmenda.REMANEJAMENTO ||
      (!!d.dotacaoOrigemId && !!d.dotacaoDestinoId),
    { message: "Remanejamento exige dotação de origem e destino.", path: ["dotacaoOrigemId"] }
  );

export type EmendaRascunhoInput = z.input<typeof emendaRascunhoSchema>;

export const parecerSchema = z.object({
  parecer: z.string().trim().min(1, "Informe o parecer."),
});
