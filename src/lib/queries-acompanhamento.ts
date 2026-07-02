import "server-only";
import { prisma } from "./prisma";
import { safe } from "./queries";

// Resumo de tramitação: quantidade e valor por status no exercício.
export async function resumoTramitacao(ano: number | null) {
  if (!ano) return [];
  const rows = await safe(
    () =>
      prisma.emenda.groupBy({
        by: ["status"],
        where: { exercicio: { ano } },
        _count: { _all: true },
        _sum: { valor: true },
      }),
    [] as { status: string; _count: { _all: number }; _sum: { valor: unknown } }[]
  );
  return rows.map((r) => ({
    status: r.status,
    quantidade: r._count._all,
    total: Number(r._sum.valor ?? 0),
  }));
}

// Consumo do teto por autor (emendas válidas/submetidas/aprovadas).
export async function consumoTetoPorAutor(ano: number | null) {
  if (!ano) return { teto: null as number | null, autores: [] };
  const teto = await safe(
    () =>
      prisma.parametroValidacao.findFirst({
        where: {
          chave: "TETO_VALOR_AUTOR",
          OR: [{ exercicio: { ano } }, { escopo: "GERAL", exercicioId: null }],
        },
      }),
    null
  );
  const tetoNum = teto ? Number(teto.valor) : null;

  const rows = await safe(
    () =>
      prisma.emenda.groupBy({
        by: ["autorId"],
        where: { exercicio: { ano }, status: { in: ["VALIDA", "SUBMETIDA", "APROVADA"] } },
        _sum: { valor: true },
      }),
    [] as { autorId: string; _sum: { valor: unknown } }[]
  );
  const autores = await safe(
    () =>
      prisma.autor.findMany({
        where: { id: { in: rows.map((r) => r.autorId) } },
        select: { id: true, nome: true },
      }),
    [] as { id: string; nome: string }[]
  );
  const nome = new Map(autores.map((a) => [a.id, a.nome]));

  return {
    teto: tetoNum,
    autores: rows
      .map((r) => ({
        autorId: r.autorId,
        nome: nome.get(r.autorId) ?? "—",
        total: Number(r._sum.valor ?? 0),
      }))
      .sort((a, b) => b.total - a.total),
  };
}

// Leis aprovadas com PL de origem (candidatas a comparação).
export async function listarComparacoes(ano: number | null) {
  return safe(
    () =>
      prisma.instrumentoPlanejamento.findMany({
        where: {
          especie: "LEI_APROVADA",
          instrumentoOrigemId: { not: null },
          exercicio: ano ? { ano } : undefined,
        },
        select: {
          id: true,
          numero: true,
          instrumentoOrigem: { select: { id: true, numero: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    []
  );
}

async function somaInstrumento(instrumentoId: string) {
  const r = await safe(
    () =>
      prisma.dotacao.aggregate({
        _sum: { valorInicial: true, valorAtual: true },
        where: { instrumentoId },
      }),
    { _sum: { valorInicial: null, valorAtual: null } }
  );
  return {
    inicial: Number(r._sum.valorInicial ?? 0),
    atual: Number(r._sum.valorAtual ?? 0),
  };
}

// Comparativo PL × lei aprovada + emendas incorporadas (acatadas).
export async function compararPLxLei(leiId: string) {
  const lei = await safe(
    () =>
      prisma.instrumentoPlanejamento.findUnique({
        where: { id: leiId },
        select: { id: true, numero: true, instrumentoOrigemId: true },
      }),
    null
  );
  if (!lei || !lei.instrumentoOrigemId) return null;

  const [pl, totalPL, totalLei, emendas] = await Promise.all([
    safe(
      () =>
        prisma.instrumentoPlanejamento.findUnique({
          where: { id: lei.instrumentoOrigemId! },
          select: { id: true, numero: true },
        }),
      null
    ),
    somaInstrumento(lei.instrumentoOrigemId),
    somaInstrumento(lei.id),
    safe(
      () =>
        prisma.emenda.findMany({
          where: { instrumentoBaseId: lei.instrumentoOrigemId!, status: "APROVADA" },
          include: {
            autor: { select: { nome: true } },
            dotacao: { select: { programa: { select: { codigo: true, nome: true } } } },
          },
          orderBy: { numero: "asc" },
        }),
      []
    ),
  ]);

  return {
    lei,
    pl,
    totalPL,
    totalLei,
    emendasAcatadas: emendas.map((e) => ({
      id: e.id,
      numero: e.numero,
      autor: e.autor.nome,
      valor: Number(e.valor),
      programa: `${e.dotacao.programa.codigo} — ${e.dotacao.programa.nome}`,
    })),
  };
}
