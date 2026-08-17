import "server-only";
import { prisma } from "./prisma";
import { safe } from "./queries";

// ============================================================================
// Consultas do OBSERVATÓRIO — emendas impositivas de outros municípios,
// coletadas de fontes públicas (scripts/coletar-observatorio.ts).
// Camada somente-leitura; nenhum dado além do que as fontes já publicam.
// ============================================================================

export const OBS_POR_PAGINA = 25;

export type FiltrosObservatorio = {
  codIbge?: string;
  ano?: number | null;
  q?: string;
  pagina?: number;
};

function whereObs(f: FiltrosObservatorio) {
  return {
    codIbge: f.codIbge || undefined,
    ano: f.ano ?? undefined,
    ...(f.q
      ? {
          OR: [
            { ementa: { contains: f.q, mode: "insensitive" as const } },
            { autor: { contains: f.q, mode: "insensitive" as const } },
            { beneficiario: { contains: f.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function resumoObservatorio() {
  const grupos = await safe(
    () =>
      prisma.emendaObservatorio.groupBy({
        by: ["codIbge", "municipio"],
        _count: { _all: true },
        _sum: { valor: true, pago: true },
        _min: { ano: true },
        _max: { ano: true },
        orderBy: { _count: { fonteId: "desc" } },
      }),
    []
  );
  return grupos.map((g) => ({
    codIbge: g.codIbge,
    municipio: g.municipio,
    qtd: g._count._all,
    valor: g._sum.valor != null ? Number(g._sum.valor) : null,
    pago: g._sum.pago != null ? Number(g._sum.pago) : null,
    anoDe: g._min.ano,
    anoAte: g._max.ano,
  }));
}

export async function listarEmendasObservatorio(f: FiltrosObservatorio) {
  const pagina = Math.max(1, f.pagina ?? 1);
  const [total, rows] = await Promise.all([
    safe(() => prisma.emendaObservatorio.count({ where: whereObs(f) }), 0),
    safe(
      () =>
        prisma.emendaObservatorio.findMany({
          where: whereObs(f),
          orderBy: [{ ano: "desc" }, { municipio: "asc" }, { numero: "asc" }],
          skip: (pagina - 1) * OBS_POR_PAGINA,
          take: OBS_POR_PAGINA,
        }),
      []
    ),
  ]);
  return {
    total,
    pagina,
    paginas: Math.max(1, Math.ceil(total / OBS_POR_PAGINA)),
    emendas: rows.map((e) => ({
      id: e.id,
      municipio: e.municipio,
      numero: e.numero,
      ano: e.ano,
      autor: e.autor,
      partido: e.partido,
      ementa: e.ementa,
      valor: e.valor != null ? Number(e.valor) : null,
      beneficiario: e.beneficiario,
      orgao: e.orgao,
      situacao: e.situacao,
      urlDetalhe: e.urlDetalhe,
      urlPdf: e.urlPdf,
    })),
  };
}

export async function opcoesFiltrosObservatorio() {
  const [municipios, anos] = await Promise.all([
    safe(
      () =>
        prisma.emendaObservatorio.groupBy({
          by: ["codIbge", "municipio"],
          orderBy: { municipio: "asc" },
        }),
      []
    ),
    safe(
      () =>
        prisma.emendaObservatorio.groupBy({
          by: ["ano"],
          where: { ano: { not: null } },
          orderBy: { ano: "desc" },
        }),
      []
    ),
  ]);
  return {
    municipios: municipios.map((m) => ({ codIbge: m.codIbge, municipio: m.municipio })),
    anos: anos.map((a) => a.ano as number),
  };
}
