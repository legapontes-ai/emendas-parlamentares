import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

// Coletor do OBSERVATÓRIO: emendas impositivas de vereadores publicadas por
// outros municípios em fontes públicas estruturadas. Piloto com 4 conectores
// (um por fornecedor de sistema legislativo/portal):
//   - SAGL/OpenLegis  → Mogi Guaçu   (JSON, tipo de matéria "Emenda Impositiva")
//   - SAPL/Interlegis → Campinas     (API REST, tipos 45/52)
//   - Dados abertos   → Santos      (JSON da prefeitura, com execução)
//   - SISCAM          → Paulínia    (HTML paginado, tipo de documento 525)
// Upsert idempotente por (fonte, fonteId) — re-execução só atualiza.
// Uso: npm run coletar:observatorio [-- --cidade mogi|campinas|santos|paulinia]

const url =
  process.env.Emendas_POSTGRES_URL_NON_POOLING ||
  process.env.Emendas_DATABASE_URL_UNPOOLED ||
  process.env.Emendas_DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;

if (!url) {
  console.error("Defina DATABASE_URL/DIRECT_URL no .env antes de coletar.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

type Linha = {
  codIbge: string;
  municipio: string;
  fonte: string;
  fonteId: string;
  numero: number | null;
  ano: number | null;
  dataApresentacao: Date | null;
  autor: string | null;
  partido: string | null;
  ementa: string | null;
  valor: number | null;
  beneficiario: string | null;
  orgao: string | null;
  saldo: number | null;
  pago: number | null;
  situacao: string | null;
  urlDetalhe: string | null;
  urlPdf: string | null;
  raw: Prisma.InputJsonValue | null;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchComRetry(alvo: string, tentativas = 6): Promise<Response | null> {
  for (let i = 0; i < tentativas; i++) {
    try {
      const res = await fetch(alvo, {
        headers: { "user-agent": "Mozilla/5.0 (Emendas360 observatorio)" },
      });
      if (res.ok) return res;
      // Fontes usam 400/404 para "sem dados" (ex.: ano sem emendas em Santos).
      if (res.status === 404 || res.status === 400) return null;
    } catch {
      /* tenta de novo */
    }
    await sleep(Math.min(1500 * (i + 1) ** 2, 30000));
  }
  throw new Error(`fonte indisponível: ${alvo}`);
}

async function fetchJson<T>(alvo: string): Promise<T | null> {
  const r = await fetchComRetry(alvo);
  return r ? ((await r.json()) as T) : null;
}

async function fetchTexto(alvo: string): Promise<string | null> {
  const r = await fetchComRetry(alvo);
  return r ? r.text() : null;
}

function dataBr(s: string | null | undefined): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s ?? "");
  return m ? new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00Z`) : null;
}

function decodificarEntidades(s: string | null | undefined): string | null {
  if (!s) return null;
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

// ---------------------------------------------------------------- Mogi Guaçu
type MateriaSagl = {
  cod_materia: number;
  num_ident_basica: number;
  ano_ident_basica: number;
  txt_ementa: string | null;
  dat_apresentacao: string | null;
  autores: string | null;
  ind_tramitacao: number;
  detail_url: string | null;
  url_texto_integral: string | null;
};

async function coletarMogi(): Promise<Linha[]> {
  const base =
    "https://sistema.camaramogiguacu.sp.gov.br/consultas/materia/materias_legislativas_json";
  const linhas: Linha[] = [];
  for (let pagina = 1; ; pagina++) {
    const d = await fetchJson<{ data: MateriaSagl[]; has_next: boolean }>(
      `${base}?tip_id_basica=33&pagina=${pagina}&itens_por_pagina=100&ordem_campo=num_ident_basica&ordem_direcao=desc`
    );
    if (!d?.data?.length) break;
    for (const m of d.data) {
      const autores = (m.autores ?? "").trim();
      const am = /^(.*?)\s+-\s+([A-ZÀ-Ü]{2,}[A-Za-zÀ-ü ]*)$/.exec(autores);
      linhas.push({
        codIbge: "3530706",
        municipio: "Mogi Guaçu",
        fonte: "SAGL-MOGIGUACU",
        fonteId: String(m.cod_materia),
        numero: m.num_ident_basica,
        ano: m.ano_ident_basica,
        dataApresentacao: dataBr(m.dat_apresentacao),
        autor: am ? am[1] : autores || null,
        partido: am ? am[2] : null,
        ementa: m.txt_ementa,
        valor: null,
        beneficiario: null,
        orgao: null,
        saldo: null,
        pago: null,
        situacao: m.ind_tramitacao ? "em tramitação" : "tramitação encerrada",
        urlDetalhe: m.detail_url,
        urlPdf: m.url_texto_integral,
        raw: m as unknown as Prisma.InputJsonValue,
      });
    }
    if (!d.has_next) break;
    await sleep(400);
  }
  return linhas;
}

// ------------------------------------------------------------------ Campinas
type MateriaSapl = {
  id: number;
  numero: number;
  ano: number;
  ementa: string | null;
  data_apresentacao: string | null;
  em_tramitacao: boolean;
  texto_original: string | null;
  autores: number[];
};

async function coletarCampinas(): Promise<Linha[]> {
  const base = "https://sapl.campinas.sp.leg.br/api";
  const cacheAutor = new Map<number, string | null>();
  async function nomeAutor(id: number): Promise<string | null> {
    if (!cacheAutor.has(id)) {
      const a = await fetchJson<{ nome?: string }>(`${base}/base/autor/${id}/`).catch(() => null);
      cacheAutor.set(id, a?.nome ?? null);
    }
    return cacheAutor.get(id) ?? null;
  }
  const linhas: Linha[] = [];
  for (const tipo of [45, 52]) {
    for (let page = 1; ; page++) {
      const d = await fetchJson<{
        results: MateriaSapl[];
        pagination: { links: { next: string | null } };
      }>(`${base}/materia/materialegislativa/?tipo=${tipo}&page=${page}&page_size=100`);
      if (!d?.results?.length) break;
      for (const m of d.results) {
        linhas.push({
          codIbge: "3509502",
          municipio: "Campinas",
          fonte: "SAPL-CAMPINAS",
          fonteId: String(m.id),
          numero: m.numero,
          ano: m.ano,
          dataApresentacao: m.data_apresentacao ? new Date(`${m.data_apresentacao}T00:00:00Z`) : null,
          autor: m.autores.length ? await nomeAutor(m.autores[0]) : null,
          partido: null,
          ementa: m.ementa,
          valor: null,
          beneficiario: null,
          orgao: null,
          saldo: null,
          pago: null,
          situacao: m.em_tramitacao ? "em tramitação" : "tramitação encerrada",
          urlDetalhe: `https://sapl.campinas.sp.leg.br/materia/${m.id}`,
          urlPdf: m.texto_original,
          raw: m as unknown as Prisma.InputJsonValue,
        });
      }
      if (!d.pagination?.links?.next) break;
      await sleep(300);
    }
  }
  return linhas;
}

// -------------------------------------------------------------------- Santos
type EmendaSantos = {
  id: number;
  ano: string;
  numero: number;
  descricao: string | null;
  nome_orgao: string | null;
  nome_entidade: string | null;
  numero_processo: string | null;
  valor: string | null;
  saldo: number | null;
  vereador: { nome?: string } | null;
  processos_pagamento: { valor: string }[] | null;
};

async function coletarSantos(): Promise<Linha[]> {
  const linhas: Linha[] = [];
  const anoAtual = new Date().getFullYear();
  for (let ano = 2015; ano <= anoAtual; ano++) {
    const d = await fetchJson<EmendaSantos[]>(
      `https://egov.santos.sp.gov.br/dadosabertos/backend/api/emendas/emendas-ano?ano=${ano}`
    );
    if (!Array.isArray(d) || !d.length) continue;
    for (const e of d) {
      const pago = (e.processos_pagamento ?? []).reduce(
        (s, p) => s + (parseFloat(p.valor) || 0),
        0
      );
      linhas.push({
        codIbge: "3548500",
        municipio: "Santos",
        fonte: "SANTOS-DADOSABERTOS",
        fonteId: String(e.id),
        numero: e.numero,
        ano: parseInt(e.ano, 10) || null,
        dataApresentacao: null,
        autor: e.vereador?.nome ?? null,
        partido: null,
        ementa: e.descricao,
        valor: e.valor != null ? parseFloat(e.valor) || null : null,
        beneficiario: e.nome_entidade,
        orgao: e.nome_orgao,
        saldo: e.saldo != null ? Number(e.saldo) : null,
        pago: pago || null,
        situacao: e.numero_processo ? `processo ${e.numero_processo}` : null,
        urlDetalhe: null,
        urlPdf: null,
        raw: e as unknown as Prisma.InputJsonValue,
      });
    }
    await sleep(300);
  }
  return linhas;
}

// ------------------------------------------------------------------ Paulínia
async function coletarPaulinia(): Promise<Linha[]> {
  const base = "https://paulinia.siscam.com.br";
  const linhas: Linha[] = [];
  const vistos = new Set<string>();
  for (let pagina = 1; pagina <= 200; pagina++) {
    const html = await fetchTexto(
      `${base}/Documentos/Pesquisa?Pesquisa=Avancada&id=78&pagina=${pagina}&Modulo=8&Documento=525&Numeracao=Documento&AnoInicial=&AnoFinal=&SubTipoId=0&Situacao=0&Classificacao=0&TipoAutor=Todos&Iniciativa=Autor&NoTexto=false`
    );
    if (!html) break;
    // Um bloco por documento: do <h4> até o próximo <h4>.
    const partes = html.split(/<h4><a href="\/Documentos\/Documento\//).slice(1);
    let novosNaPagina = 0;
    for (const parte of partes) {
      const cab = /^(\d+)"[^>]*title="Emenda Impositiva N[ºo°]\s*(\d+)"/.exec(parte);
      if (!cab) continue;
      const [, docId, numero] = cab;
      if (vistos.has(docId)) continue;
      vistos.add(docId);
      novosNaPagina++;
      const bloco = parte.split("<h4>")[0];
      const data = /<strong>Data:<\/strong>\s*([\d/]+)/.exec(bloco)?.[1];
      const autoria = /<strong>Autoria:<\/strong>\s*([^<]+)</.exec(bloco)?.[1];
      const assunto = /<strong>Assunto:<\/strong>\s*([^<]+)</.exec(bloco)?.[1];
      const quando = dataBr(data?.trim());
      linhas.push({
        codIbge: "3536505",
        municipio: "Paulínia",
        fonte: "SISCAM-PAULINIA",
        fonteId: docId,
        numero: parseInt(numero, 10),
        ano: quando ? quando.getUTCFullYear() : null,
        dataApresentacao: quando,
        autor: decodificarEntidades(autoria?.trim()),
        partido: null,
        ementa: decodificarEntidades(assunto?.trim()),
        valor: null,
        beneficiario: null,
        orgao: null,
        saldo: null,
        pago: null,
        situacao: null,
        urlDetalhe: `${base}/Documentos/Documento/${docId}`,
        urlPdf: null,
        raw: null,
      });
    }
    if (!novosNaPagina) break;
    await sleep(600);
  }
  return linhas;
}

// ---------------------------------------------------------------------- main
const COLETORES: Record<string, () => Promise<Linha[]>> = {
  mogi: coletarMogi,
  campinas: coletarCampinas,
  santos: coletarSantos,
  paulinia: coletarPaulinia,
};

const argCidade = process.argv.indexOf("--cidade");
const cidade = argCidade >= 0 ? process.argv[argCidade + 1] : null;
if (cidade && !COLETORES[cidade]) {
  console.error(`cidade desconhecida: ${cidade} (use mogi|campinas|santos|paulinia)`);
  process.exit(1);
}
const alvo = cidade ? { [cidade]: COLETORES[cidade] } : COLETORES;

async function main() {
  for (const [nome, coletar] of Object.entries(alvo)) {
    const t0 = Date.now();
    const linhas = await coletar();
    for (const l of linhas) {
      const { fonte, fonteId, raw, ...resto } = l;
      const dados = { ...resto, raw: raw ?? Prisma.JsonNull };
      await prisma.emendaObservatorio.upsert({
        where: { fonte_fonteId: { fonte, fonteId } },
        create: { fonte, fonteId, ...dados },
        update: dados,
      });
    }
    console.log(
      `${nome}: ${linhas.length} emendas em ${((Date.now() - t0) / 1000).toFixed(0)}s`
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
