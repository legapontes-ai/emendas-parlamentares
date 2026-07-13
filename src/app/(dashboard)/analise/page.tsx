import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { podeTramitar } from "@/lib/authz";
import { getAnoAtivo } from "@/lib/exercicio";
import { getDados360, brl } from "@/lib/queries-360";
import { ROTULO_STATUS_EMENDA } from "@/lib/rotulos";
import { SecTitle } from "@/components/e360/sec-title";
import { KpiCard } from "@/components/e360/kpi-card";
import { Card360, CardSrc, Eyebrow } from "@/components/e360/card360";
import { Banner } from "@/components/e360/banner";
import { Tag360, tomDoStatus } from "@/components/e360/tag360";
import { TramitacaoActions } from "@/components/emendas/tramitacao-actions";
import { PrintButton } from "@/components/emendas/print-button";
import { EmptyState } from "@/components/empty-state";

export default async function AnalisePage() {
  const user = await getCurrentUser();
  const ano = await getAnoAtivo();
  const { params, emendas, consolidado: c, porStatus } = await getDados360(ano);
  const podeAgir = podeTramitar(user);

  const qtd = (s: string) => porStatus.find((x) => x.status === s)?.qtd ?? 0;
  const conferidas = emendas.filter((e) => e.status !== "RASCUNHO").length;
  const invalidas = emendas.filter((e) => e.status === "INVALIDA");
  const submetidas = emendas.filter((e) => e.status === "SUBMETIDA");
  const validas = emendas.filter((e) => e.status === "VALIDA");
  const decididas = qtd("APROVADA") + qtd("REJEITADA");

  const saudeAbaixo =
    c.pisoSaudeGlobal != null && c.valorSaude < c.pisoSaudeGlobal;

  // Fila de trabalho: primeiro o que precisa de gente, depois o que está pronto.
  const fila = [...submetidas, ...invalidas, ...validas];

  return (
    <div>
      <Banner tom="vermelho" emoji="⚖️">
        <b>
          O motor confere os requisitos formais; o relator revisa, decide e
          assina
        </b>{" "}
        (Human First) · o juízo de mérito é sempre do parlamentar
      </Banner>

      <SecTitle
        titulo="Conferência & Análise Técnica"
        nota="o motor valida → o que não conforma volta p/ saneamento → o relator emite o parecer · antes da deliberação"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          eyebrow="Emendas conferidas"
          numero={String(conferidas)}
          rotulo="cota, teto, base e classificação verificados pelo motor"
        />
        <KpiCard
          eyebrow="Para saneamento"
          numero={String(invalidas.length)}
          rotulo="inválidas — devolver ao autor para correção"
          delta={
            invalidas.length > 0
              ? { tom: "warn", texto: "requer ação" }
              : { tom: "up", texto: "nenhuma pendência" }
          }
        />
        <KpiCard
          eyebrow="Aguardando parecer"
          numero={String(submetidas.length)}
          rotulo="submetidas para aprovar/rejeitar"
          delta={
            submetidas.length > 0
              ? { tom: "warn", texto: podeAgir ? "decidir abaixo" : "aguardando relator" }
              : { tom: "up", texto: "fila vazia" }
          }
        />
        <KpiCard
          eyebrow="Decididas"
          numero={String(decididas)}
          rotulo={`aprovadas ${qtd("APROVADA")} · rejeitadas ${qtd("REJEITADA")}`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Card360>
          <Eyebrow>
            Fila de validação — nada é consolidado sem o relator assinar
          </Eyebrow>
          {fila.length === 0 ? (
            <EmptyState
              titulo="Fila vazia"
              descricao="Nenhuma emenda aguardando saneamento ou parecer neste exercício."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {fila.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center gap-3 rounded-[10px] border bg-background/60 px-3.5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/legislativo/emendas/${e.id}`}
                      className="block truncate text-[13.5px] font-bold hover:text-brand-cyan hover:underline"
                    >
                      Emenda {e.numero} — {e.objeto}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {e.autorNome} · {e.orgaoNome} · {brl(e.valor)}
                    </span>
                  </div>
                  <Tag360 tom={tomDoStatus(e.status)}>
                    {ROTULO_STATUS_EMENDA[e.status] ?? e.status}
                  </Tag360>
                  {podeAgir && e.status === "SUBMETIDA" ? (
                    <TramitacaoActions id={e.id} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
          <CardSrc>
            trilha: motor conferiu → relator revisou → decidiu (tudo vai à
            auditoria) · saneamento: o autor edita e revalida a emenda
          </CardSrc>
        </Card360>

        <Card360>
          <Eyebrow>Prévia — parecer da conferência formal · exercício {ano ?? "—"}</Eyebrow>
          <div className="rounded-[10px] border bg-[#fdfdfb] p-6 font-serif text-[13.5px] leading-relaxed text-[#1d2b4f] dark:bg-card">
            <p>
              <b>
                PARECER DA CONFERÊNCIA FORMAL — EMENDAS AO ORÇAMENTO · EXERCÍCIO{" "}
                {ano ?? "—"}
              </b>
            </p>
            <br />
            <p>
              <b>Universo conferido:</b> {c.qtd} emendas de {c.autoresComEmenda}{" "}
              autor(es), somando {brl(c.valor)}
              {c.tetoGlobal != null ? (
                <>
                  {" "}
                  ({Math.round((c.valor / c.tetoGlobal) * 100)}% do teto global de{" "}
                  {brl(c.tetoGlobal)})
                </>
              ) : null}
              .
            </p>
            {params.cotaPorAutor != null ? (
              <p>
                <b>Cota individual:</b> {brl(params.cotaPorAutor)} por autor.
              </p>
            ) : null}
            {c.pisoSaudeGlobal != null ? (
              <p>
                <b>Reserva de saúde:</b> {brl(c.valorSaude)} destinados à saúde
                — {saudeAbaixo ? "ABAIXO" : "acima"} do piso de{" "}
                {brl(c.pisoSaudeGlobal)} ({params.reservaSaudePct}%).
              </p>
            ) : null}
            <p>
              <b>Ressalvas:</b>{" "}
              {invalidas.length > 0 || saudeAbaixo
                ? [
                    invalidas.length > 0
                      ? `${invalidas.length} emenda(s) inválida(s) devolvida(s) para saneamento`
                      : null,
                    saudeAbaixo ? "reserva de saúde abaixo do piso" : null,
                  ]
                    .filter(Boolean)
                    .join("; ") + "."
                : "não há."}
            </p>
            <p>
              <b>Conclusão:</b> pela admissibilidade das emendas conformes,
              condicionada ao saneamento das ressalvas antes da consolidação.
            </p>
            <br />
            <p className="text-[11.5px] text-muted-foreground">
              Requisitos formais conferidos automaticamente a partir das emendas
              e parâmetros registrados ·{" "}
              <b>juízo e assinatura: relator da comissão.</b>
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <PrintButton />
            <Link
              href="/legislativo/tramitacao/relatorios"
              className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-primary hover:border-brand-cyan"
            >
              ⬇ Relatórios e exportação
            </Link>
          </div>
        </Card360>
      </div>
    </div>
  );
}
