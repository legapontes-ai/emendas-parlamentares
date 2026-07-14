import "server-only";
import { prisma } from "./prisma";
import { safe } from "./queries";

// ============================================================================
// Consultas do PORTAL PÚBLICO (transparência ativa — STF: "meio eletrônico,
// com busca e filtros"). Somente campos públicos; nada de dados pessoais.
// ============================================================================

export const POR_PAGINA = 25;

export type FiltrosPublicos = {
  ano?: number | null;
  autorId?: string;
  status?: string;
  q?: string;
  pagina?: number;
};

const STATUS_PUBLICOS = [
  "SUBMETIDA",
  "EM_TRAMITACAO",
  "APROVADA",
  "REJEITADA",
  "VALIDA",
  "INVALIDA",
] as const;

function wherePublico(f: FiltrosPublicos) {
  return {
    exercicio: f.ano ? { ano: f.ano } : undefined,
    autorId: f.autorId || undefined,
    status: f.status ? (f.status as never) : undefined,
    ...(f.q
      ? {
          OR: [
            { objeto: { contains: f.q, mode: "insensitive" as const } },
            { beneficiario: { nome: { contains: f.q, mode: "insensitive" as const } } },
            { autor: { nome: { contains: f.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
}

export async function listarEmendasPublicas(f: FiltrosPublicos) {
  const pagina = Math.max(1, f.pagina ?? 1);
  const [total, rows] = await Promise.all([
    safe(() => prisma.emenda.count({ where: wherePublico(f) }), 0),
    safe(
      () =>
        prisma.emenda.findMany({
          where: wherePublico(f),
          select: {
            id: true,
            numero: true,
            objeto: true,
            valor: true,
            status: true,
            exercicio: { select: { ano: true } },
            autor: { select: { nome: true } },
            beneficiario: { select: { nome: true, tipo: true } },
            dotacao: { select: { funcao: { select: { codigo: true, nome: true } } } },
          },
          orderBy: [{ exercicio: { ano: "desc" } }, { numero: "asc" }],
          skip: (pagina - 1) * POR_PAGINA,
          take: POR_PAGINA,
        }),
      []
    ),
  ]);
  return {
    total,
    pagina,
    paginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
    emendas: rows.map((e) => ({
      id: e.id,
      numero: e.numero,
      ano: e.exercicio.ano,
      objeto: e.objeto,
      valor: Number(e.valor),
      status: e.status,
      autor: e.autor.nome,
      beneficiario: e.beneficiario?.nome ?? null,
      beneficiarioTipo: e.beneficiario?.tipo ?? null,
      funcao: `${e.dotacao.funcao.codigo} — ${e.dotacao.funcao.nome}`,
    })),
  };
}

export async function getEmendaPublica(id: string) {
  return safe(
    () =>
      prisma.emenda.findUnique({
        where: { id },
        select: {
          id: true,
          numero: true,
          objeto: true,
          justificativa: true,
          valor: true,
          status: true,
          tipo: true,
          createdAt: true,
          updatedAt: true,
          exercicio: { select: { ano: true } },
          instrumentoBase: { select: { numero: true, tipo: true } },
          autor: { select: { nome: true, cargo: true } },
          beneficiario: { select: { nome: true, tipo: true, cnpj: true } },
          dotacao: {
            select: {
              orgao: { select: { codigo: true, nome: true } },
              funcao: { select: { codigo: true, nome: true } },
              programa: { select: { codigo: true, nome: true } },
            },
          },
          validacoes: {
            orderBy: { executadaEm: "desc" },
            take: 1,
            select: { resultado: true, executadaEm: true },
          },
        },
      }),
    null
  );
}

export async function opcoesFiltrosPublicos() {
  const [exercicios, autores] = await Promise.all([
    safe(
      () =>
        prisma.exercicio.findMany({
          select: { ano: true },
          orderBy: { ano: "desc" },
        }),
      [] as { ano: number }[]
    ),
    safe(
      () =>
        prisma.autor.findMany({
          where: { emendas: { some: {} } },
          select: { id: true, nome: true },
          orderBy: { nome: "asc" },
        }),
      [] as { id: string; nome: string }[]
    ),
  ]);
  return { exercicios, autores, statusPublicos: [...STATUS_PUBLICOS] };
}
