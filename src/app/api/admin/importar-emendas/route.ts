import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// ============================================================================
// ROTA TEMPORÁRIA de bootstrap: importa as emendas reais (planilha consolidada
// da Câmara) para um exercício, com base sintética de classificação.
// Protegida por sessão de SUPER_ADMIN. Idempotente (ids estáveis mg26-*).
// REMOVER após o uso — mesmo padrão da rota de seed do PROMPT 11.
// ============================================================================

export const maxDuration = 60;

const Payload = z.object({
  exercicio: z.number().int().min(2020).max(2100),
  // Remove do exercício as emendas NÃO importadas (ids fora do prefixo mg*) —
  // limpa registros demo que colidem com a numeração real.
  limparDemo: z.boolean().optional(),
  parametros: z.record(z.string(), z.string()).optional(),
  autores: z.array(z.object({ curto: z.string().min(1), completo: z.string().min(1) })),
  emendas: z.array(
    z.object({
      seq: z.number().int().positive(),
      autor: z.string().min(1),
      area: z.enum(["Saúde", "Outros"]),
      nOrig: z.string(),
      descricao: z.string().min(1),
      valor: z.number().min(0),
      lei: z.string().optional(),
      destaque: z.boolean().optional(),
      retirada: z.boolean().optional(),
    })
  ),
});

type Destino = {
  orgao: [string, string];
  funcao: [string, string];
  subfuncao: [string, string];
};

// Classificação sintética por palavra-chave (aproximação declarada — a área
// Saúde/Outros vem da planilha; o órgão organiza a vista de destinos).
function mapearDestino(area: string, descricao: string): Destino {
  if (area === "Saúde")
    return {
      orgao: ["10", "Secretaria de Saúde"],
      funcao: ["10", "Saúde"],
      subfuncao: ["301", "Atenção Básica"],
    };
  const d = descricao;
  const regras: [RegExp, Destino][] = [
    [
      /EMEF|EMEB|EMEI|CEI\b|CEI |APM\b|Educa|Escola|Creche/i,
      { orgao: ["08", "Secretaria de Educação"], funcao: ["12", "Educação"], subfuncao: ["361", "Ensino Fundamental"] },
    ],
    [
      /Guarda|Seguran|Canil|Fundo Municipal de Segurança|TG\b/i,
      { orgao: ["06", "Secretaria de Segurança Pública"], funcao: ["06", "Segurança Pública"], subfuncao: ["181", "Policiamento"] },
    ],
    [
      /\bSSM\b/i,
      { orgao: ["20", "SSM — Serviços Municipais"], funcao: ["15", "Urbanismo"], subfuncao: ["452", "Serviços Urbanos"] },
    ],
    [
      /\bSOM\b/i,
      { orgao: ["21", "SOM — Obras e Mobilidade"], funcao: ["15", "Urbanismo"], subfuncao: ["451", "Infraestrutura Urbana"] },
    ],
    [
      /SAAMA/i,
      { orgao: ["22", "SAAMA — Agricultura e Meio Ambiente"], funcao: ["18", "Gestão Ambiental"], subfuncao: ["541", "Preservação Ambiental"] },
    ],
    [
      /Sub\s?prefeitura/i,
      { orgao: ["23", "Subprefeitura de Martinho Prado"], funcao: ["04", "Administração"], subfuncao: ["122", "Administração Geral"] },
    ],
    [
      /Esporte|Centro Esportivo|Futsal|Playground|Ginástica|Skate/i,
      { orgao: ["24", "Secretaria de Esporte e Lazer"], funcao: ["27", "Desporto e Lazer"], subfuncao: ["812", "Desporto Comunitário"] },
    ],
    [
      /Cultura|Corpora[çc][ãa]o Musical|\bFEG\b/i,
      { orgao: ["25", "Secretaria de Cultura"], funcao: ["13", "Cultura"], subfuncao: ["392", "Difusão Cultural"] },
    ],
    [
      /Associa|Institut|\bLar\b|Casa d|APAE|POLEM|Vinha|[ÁA]gape|Acolhem|Pastoral|Igreja|Par[óo]quia|Mundo Melhor|Anjos|Ex[ée]rcito de Cristo|Jesus Chama|CALVI|CAMP\b|CARS\b|CASMO[ÇC]U|Centro Dia|Mais Vida|Focinhos|PAS\b/i,
      { orgao: ["26", "Assistência Social e Entidades"], funcao: ["08", "Assistência Social"], subfuncao: ["244", "Assistência Comunitária"] },
    ],
  ];
  for (const [re, destino] of regras) if (re.test(d)) return destino;
  return {
    orgao: ["02", "Governo Municipal"],
    funcao: ["04", "Administração"],
    subfuncao: ["122", "Administração Geral"],
  };
}

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Apenas SUPER_ADMIN." }, { status: 403 });
  }
  const body = Payload.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.message }, { status: 400 });
  }
  const { exercicio: ano, limparDemo, parametros, autores, emendas } = body.data;
  // Prefixo estável por ano (2026 → "mg26", compatível com o já importado).
  const pref = `mg${String(ano).slice(-2)}`;

  if (limparDemo) {
    await prisma.emenda.deleteMany({
      where: { exercicio: { ano }, NOT: { id: { startsWith: "mg" } } },
    });
  }

  // Exercício + parâmetros do exercício.
  const ex = await prisma.exercicio.upsert({
    where: { ano },
    create: { ano, status: "ABERTO" },
    update: { status: "ABERTO" },
  });
  for (const [chave, valor] of Object.entries(parametros ?? {})) {
    const atual = await prisma.parametroValidacao.findFirst({
      where: { exercicioId: ex.id, chave },
    });
    if (atual) {
      await prisma.parametroValidacao.update({ where: { id: atual.id }, data: { valor } });
    } else {
      await prisma.parametroValidacao.create({
        data: { escopo: "EXERCICIO", exercicioId: ex.id, chave, valor, modo: "ALERTA" },
      });
    }
  }

  // Instrumento base (PL da LOA).
  const pl = await prisma.instrumentoPlanejamento.upsert({
    where: { id: `${pref}-pl-loa-${ano}` },
    create: {
      id: `${pref}-pl-loa-${ano}`,
      tipo: "LOA",
      especie: "PROJETO_LEI",
      numero: `PL LOA ${ano}`,
      ementa: `Estima a receita e fixa a despesa do Município para o exercício de ${ano}.`,
      exercicioId: ex.id,
      status: "EM_TRAMITACAO",
    },
    update: { status: "EM_TRAMITACAO" },
  });

  // Autores: a mesma pessoa atravessa exercícios — resolve por nome antes de
  // criar (Adriano de 2026 é o mesmo Autor nas alterações de 2025).
  const autorId = new Map<string, string>();
  for (const a of autores) {
    const existente = await prisma.autor.findFirst({ where: { nome: a.curto } });
    if (existente) {
      await prisma.autor.update({
        where: { id: existente.id },
        data: { cargo: a.completo },
      });
      autorId.set(a.curto, existente.id);
      continue;
    }
    const id = `mg-a-${slug(a.curto)}`;
    await prisma.autor.upsert({
      where: { id },
      create: { id, nome: a.curto, cargo: a.completo },
      update: { nome: a.curto, cargo: a.completo },
    });
    autorId.set(a.curto, id);
  }

  // Classificação sintética + dotações (uma por órgão/função usados).
  const destinos = new Map<string, { destino: Destino; total: number }>();
  const destinoDaEmenda = new Map<number, string>();
  for (const e of emendas) {
    const destino = mapearDestino(e.area, e.descricao);
    const chave = `${destino.orgao[0]}-${destino.funcao[0]}`;
    const atual = destinos.get(chave) ?? { destino, total: 0 };
    atual.total += e.valor;
    destinos.set(chave, atual);
    destinoDaEmenda.set(e.seq, chave);
  }

  const natureza = await prisma.naturezaDespesa.upsert({
    where: { exercicioId_codigo: { exercicioId: ex.id, codigo: "3.3.90.39" } },
    create: {
      codigo: "3.3.90.39",
      categoriaEconomica: "3",
      grupo: "3",
      modalidadeAplicacao: "90",
      elemento: "39",
      exercicioId: ex.id,
    },
    update: {},
  });
  const fonte = await prisma.fonteRecurso.upsert({
    where: { exercicioId_codigo: { exercicioId: ex.id, codigo: "500" } },
    create: { codigo: "500", nome: "Recursos Ordinários", exercicioId: ex.id },
    update: {},
  });

  const dotacaoDoDestino = new Map<string, string>();
  const programa = await prisma.programa.upsert({
    where: { exercicioId_codigo: { exercicioId: ex.id, codigo: "0026" } },
    create: { codigo: "0026", nome: "Emendas Impositivas", exercicioId: ex.id },
    update: {},
  });
  for (const [chave, { destino, total }] of destinos) {
    const orgao = await prisma.orgao.upsert({
      where: { exercicioId_codigo: { exercicioId: ex.id, codigo: destino.orgao[0] } },
      create: { codigo: destino.orgao[0], nome: destino.orgao[1], exercicioId: ex.id },
      update: { nome: destino.orgao[1] },
    });
    const uo = await prisma.unidadeOrcamentaria.upsert({
      where: {
        exercicioId_orgaoId_codigo: {
          exercicioId: ex.id,
          orgaoId: orgao.id,
          codigo: `${destino.orgao[0]}.01`,
        },
      },
      create: {
        codigo: `${destino.orgao[0]}.01`,
        nome: destino.orgao[1],
        orgaoId: orgao.id,
        exercicioId: ex.id,
      },
      update: {},
    });
    const funcao = await prisma.funcao.upsert({
      where: { exercicioId_codigo: { exercicioId: ex.id, codigo: destino.funcao[0] } },
      create: { codigo: destino.funcao[0], nome: destino.funcao[1], exercicioId: ex.id },
      update: { nome: destino.funcao[1] },
    });
    const sub = await prisma.subfuncao.upsert({
      where: {
        exercicioId_funcaoId_codigo: {
          exercicioId: ex.id,
          funcaoId: funcao.id,
          codigo: destino.subfuncao[0],
        },
      },
      create: {
        codigo: destino.subfuncao[0],
        nome: destino.subfuncao[1],
        funcaoId: funcao.id,
        exercicioId: ex.id,
      },
      update: {},
    });
    const acao = await prisma.acao.upsert({
      where: {
        exercicioId_programaId_codigo: {
          exercicioId: ex.id,
          programaId: programa.id,
          codigo: `9${destino.orgao[0]}`,
        },
      },
      create: {
        codigo: `9${destino.orgao[0]}`,
        nome: `Apoios e transferências — ${destino.orgao[1]}`,
        tipo: "ATIVIDADE",
        programaId: programa.id,
        exercicioId: ex.id,
      },
      update: {},
    });
    const dot = await prisma.dotacao.upsert({
      where: { id: `${pref}-dot-${chave}` },
      create: {
        id: `${pref}-dot-${chave}`,
        instrumentoId: pl.id,
        exercicioId: ex.id,
        orgaoId: orgao.id,
        unidadeOrcamentariaId: uo.id,
        funcaoId: funcao.id,
        subfuncaoId: sub.id,
        programaId: programa.id,
        acaoId: acao.id,
        naturezaDespesaId: natureza.id,
        fonteRecursoId: fonte.id,
        valorInicial: Math.round(total * 100) / 100,
        valorAtual: Math.round(total * 100) / 100,
      },
      update: {
        valorInicial: Math.round(total * 100) / 100,
        valorAtual: Math.round(total * 100) / 100,
      },
    });
    dotacaoDoDestino.set(chave, dot.id);
  }

  // Emendas (createMany idempotente por id estável).
  const completoDe = new Map(autores.map((a) => [a.curto, a.completo]));
  const criadas = await prisma.emenda.createMany({
    skipDuplicates: true,
    data: emendas.map((e) => {
      const retirada = e.retirada || /retirad[oa] pelo autor/i.test(e.descricao);
      const notas = [
        e.lei ? `Acatada pela ${e.lei}.` : null,
        e.destaque ? "Com destaque." : null,
        retirada ? "Retirada pelo autor." : null,
      ]
        .filter(Boolean)
        .join(" ");
      return {
        id: `${pref}-e-${e.seq}`,
        numero: String(e.seq),
        exercicioId: ex.id,
        instrumentoBaseId: pl.id,
        autorId: autorId.get(e.autor)!,
        dotacaoId: dotacaoDoDestino.get(destinoDaEmenda.get(e.seq)!)!,
        tipo: "IMPOSITIVA" as const,
        objeto: e.descricao,
        justificativa:
          `Item ${e.nOrig || e.seq} da cota de ${completoDe.get(e.autor) ?? e.autor} — importado da planilha consolidada (LOA ${ano}).${notas ? " " + notas : ""}`,
        valor: e.valor,
        // Retirada não tramita; com lei já foi acatada; o resto aguarda parecer.
        status: retirada
          ? ("RASCUNHO" as const)
          : e.lei
            ? ("APROVADA" as const)
            : ("SUBMETIDA" as const),
      };
    }),
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: user.id === "dev-user" ? null : user.id,
      entidade: "Emenda",
      entidadeId: `importacao-${ano}`,
      acao: "IMPORTAR_PLANILHA",
      dadosDepois: {
        exercicio: ano,
        autores: autores.length,
        emendas: emendas.length,
        criadas: criadas.count,
        dotacoes: destinos.size,
      },
    },
  });

  return NextResponse.json({
    ok: true,
    exercicio: ano,
    autores: autores.length,
    dotacoes: destinos.size,
    emendasRecebidas: emendas.length,
    emendasCriadas: criadas.count,
  });
}
