import Link from "next/link";
import { LogoEmendas360 } from "@/components/logo-emendas360";
import { SecTitle } from "@/components/e360/sec-title";
import { KpiCard } from "@/components/e360/kpi-card";
import { Card360, CardSrc } from "@/components/e360/card360";
import { Banner } from "@/components/e360/banner";
import { brl, brlCompacto } from "@/lib/queries-360";
import {
  listarEmendasObservatorio,
  opcoesFiltrosObservatorio,
  resumoObservatorio,
  OBS_POR_PAGINA,
} from "@/lib/queries-observatorio";

// Observatório: emendas impositivas de OUTROS municípios, coletadas de fontes
// públicas (sistemas legislativos e dados abertos). Benchmark entre cidades —
// somente-leitura, sem relação com o fluxo operacional do município anfitrião.
export default async function ObservatorioPage({
  searchParams,
}: {
  searchParams: Promise<{
    cidade?: string;
    ano?: string;
    q?: string;
    pagina?: string;
  }>;
}) {
  const sp = await searchParams;
  const filtros = {
    codIbge: sp.cidade,
    ano: sp.ano ? Number(sp.ano) : null,
    q: sp.q?.trim() || undefined,
    pagina: sp.pagina ? Number(sp.pagina) : 1,
  };
  const [resumo, { total, pagina, paginas, emendas }, opcoes] = await Promise.all([
    resumoObservatorio(),
    listarEmendasObservatorio(filtros),
    opcoesFiltrosObservatorio(),
  ]);

  const qs = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { cidade: sp.cidade, ano: sp.ano, q: sp.q, ...over };
    for (const [k, v] of Object.entries(merged)) {
      if (v != null && String(v).length > 0) p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const controle =
    "h-9 rounded-lg border-[1.5px] border-border bg-card px-3 text-sm outline-none focus:border-brand-cyan";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="grad-dark text-white shadow-[0_2px_14px_rgba(6,24,64,.35)]">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-5">
          <Link href="/publica">
            <LogoEmendas360 />
          </Link>
          <Link
            href="/login"
            className="ml-auto rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#d6e2f7] hover:bg-white/20"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-5 pb-16 pt-6">
        <Banner tom="ok" emoji="🌎">
          <b>Observatório de emendas impositivas</b> — como outros municípios
          paulistas praticam o orçamento impositivo, a partir do que suas
          câmaras e prefeituras publicam em fontes oficiais.
        </Banner>

        <SecTitle
          titulo="Emendas impositivas em outros municípios"
          nota="coletadas de sistemas legislativos e dados abertos oficiais"
        />

        {resumo.length === 0 ? (
          <Card360>
            <p className="text-sm text-muted-foreground">
              O observatório ainda não foi carregado — rode{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                npm run coletar:observatorio
              </code>{" "}
              para importar as emendas das fontes públicas.
            </p>
          </Card360>
        ) : (
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resumo.map((r) => (
              <KpiCard
                key={r.codIbge}
                eyebrow={`${r.municipio} · ${r.anoDe ?? "—"}–${r.anoAte ?? "—"}`}
                numero={String(r.qtd)}
                rotulo={
                  r.valor
                    ? `emendas · ${brlCompacto(r.valor)} indicados${r.pago ? ` · ${brlCompacto(r.pago)} pagos` : ""}`
                    : "emendas coletadas da fonte oficial"
                }
              />
            ))}
          </div>
        )}

        {/* Filtros — GET simples: funciona sem JavaScript */}
        <form className="mb-4 flex flex-wrap items-center gap-2" method="GET">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Buscar por objeto, autor ou beneficiário…"
            className={`${controle} min-w-60 flex-1`}
          />
          <select name="cidade" defaultValue={sp.cidade ?? ""} className={controle}>
            <option value="">Todos os municípios</option>
            {opcoes.municipios.map((m) => (
              <option key={m.codIbge} value={m.codIbge}>
                {m.municipio}
              </option>
            ))}
          </select>
          <select name="ano" defaultValue={sp.ano ?? ""} className={controle}>
            <option value="">Todos os anos</option>
            {opcoes.anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="grad-main h-9 rounded-lg px-4 text-[13px] font-bold text-white hover:brightness-110"
          >
            Filtrar
          </button>
          {sp.q || sp.cidade || sp.ano ? (
            <Link
              href="/publica/observatorio"
              className="text-xs font-bold text-brand-cyan hover:underline"
            >
              limpar
            </Link>
          ) : null}
        </form>

        <Card360>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Município", "Nº/Ano", "Autor", "Objeto", "Beneficiário", "Valor", "Fonte"].map(
                    (h) => (
                      <th
                        key={h}
                        className="border-b-2 border-border px-2.5 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {emendas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-2.5 py-8 text-center text-muted-foreground">
                      Nenhuma emenda encontrada com esses filtros.
                    </td>
                  </tr>
                ) : (
                  emendas.map((e) => (
                    <tr key={e.id}>
                      <td className="border-b border-border px-2.5 py-2 whitespace-nowrap font-semibold">
                        {e.municipio}
                      </td>
                      <td className="border-b border-border px-2.5 py-2 whitespace-nowrap font-bold">
                        {e.numero ?? "—"}/{e.ano ?? "—"}
                      </td>
                      <td className="border-b border-border px-2.5 py-2 whitespace-nowrap">
                        {e.autor ?? <span className="text-muted-foreground">—</span>}
                        {e.partido ? (
                          <span className="text-muted-foreground"> · {e.partido}</span>
                        ) : null}
                      </td>
                      <td className="max-w-80 border-b border-border px-2.5 py-2">
                        <span className="line-clamp-2">{e.ementa ?? "—"}</span>
                      </td>
                      <td className="max-w-56 border-b border-border px-2.5 py-2">
                        <span className="line-clamp-2">
                          {e.beneficiario ?? e.orgao ?? (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </span>
                      </td>
                      <td className="border-b border-border px-2.5 py-2 whitespace-nowrap font-semibold tabular-nums">
                        {e.valor != null ? brl(e.valor) : "—"}
                      </td>
                      <td className="border-b border-border px-2.5 py-2 whitespace-nowrap">
                        {e.urlDetalhe || e.urlPdf ? (
                          <a
                            href={(e.urlDetalhe ?? e.urlPdf) as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-brand-cyan hover:underline"
                          >
                            ver na origem ↗
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <CardSrc
            direita={
              paginas > 1 ? (
                <span className="flex gap-3">
                  {pagina > 1 ? (
                    <Link
                      className="font-bold text-brand-cyan hover:underline"
                      href={qs({ pagina: pagina - 1 })}
                    >
                      ← anterior
                    </Link>
                  ) : null}
                  <span>
                    página {pagina} de {paginas}
                  </span>
                  {pagina < paginas ? (
                    <Link
                      className="font-bold text-brand-cyan hover:underline"
                      href={qs({ pagina: pagina + 1 })}
                    >
                      próxima →
                    </Link>
                  ) : null}
                </span>
              ) : undefined
            }
          >
            {total} emenda(s) · {OBS_POR_PAGINA} por página · valores e beneficiários
            aparecem quando a fonte os publica de forma estruturada
          </CardSrc>
        </Card360>

        <p className="mt-4 text-[13px] text-muted-foreground">
          Veja também:{" "}
          <Link href="/publica" className="font-bold text-brand-cyan hover:underline">
            panorama do município
          </Link>
          {" · "}
          <Link href="/publica/emendas" className="font-bold text-brand-cyan hover:underline">
            consulta pública de emendas
          </Link>
        </p>
      </main>
    </div>
  );
}
