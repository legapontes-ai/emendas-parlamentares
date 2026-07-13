import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/session";
import { getAnoAtivo } from "@/lib/exercicio";
import { getDados360, brl, brlCompacto } from "@/lib/queries-360";
import { ROTULO_STATUS_EMENDA } from "@/lib/rotulos";
import { SecTitle } from "@/components/e360/sec-title";
import { KpiCard } from "@/components/e360/kpi-card";
import { Card360, CardSrc, Eyebrow } from "@/components/e360/card360";
import { Farol, type FarolItemDado } from "@/components/e360/farol";
import { MiniBar } from "@/components/e360/minibar";
import { Banner } from "@/components/e360/banner";
import { Tag360 } from "@/components/e360/tag360";
import { EmptyState } from "@/components/empty-state";

export default async function PainelPage() {
  const user = await getCurrentUser();
  // Gabinete do vereador cai direto na sua visão 360.
  if (user.role === Role.LEG_AUTOR) redirect("/vereador360");

  const ano = await getAnoAtivo();
  const { params, emendas, consolidado: c, porAutor, porDestino, porStatus } =
    await getDados360(ano);

  const tituloPainel =
    user.poder === "EXECUTIVO" ? "Painel do Executivo" : "Painel da Comissão";

  if (!ano || emendas.length === 0) {
    return (
      <div>
        <SecTitle
          titulo={tituloPainel}
          nota={ano ? `exercício ${ano}` : "nenhum exercício ativo"}
        />
        <EmptyState
          titulo="Sem emendas no exercício"
          descricao="Quando as emendas forem apresentadas sobre o projeto de lei base, o painel consolida cota, teto, reserva de saúde e destinos automaticamente."
          acao={
            <Link
              href="/legislativo/emendas/nova"
              className="text-sm font-bold text-brand-cyan hover:underline"
            >
              Apresentar emenda →
            </Link>
          }
        />
      </div>
    );
  }

  const saudeAbaixo =
    c.pisoSaudeGlobal != null && c.valorSaude < c.pisoSaudeGlobal;
  const invalidas = porStatus.find((s) => s.status === "INVALIDA");
  const submetidas = porStatus.find((s) => s.status === "SUBMETIDA");
  const acimaDaCota =
    params.cotaPorAutor != null
      ? porAutor.filter((a) => a.valorTotal > params.cotaPorAutor! + 0.5)
      : [];
  const abaixoPisoSaude =
    c.pisoSaudeAutor != null
      ? porAutor.filter((a) => a.valorSaude < c.pisoSaudeAutor! - 0.5)
      : [];

  const farol: FarolItemDado[] = [];
  if (saudeAbaixo) {
    farol.push({
      tom: "a",
      titulo: "Reserva de saúde consolidada abaixo do piso",
      texto: `${brlCompacto(c.valorSaude)} × piso ${brlCompacto(c.pisoSaudeGlobal!)} (${params.reservaSaudePct}% do teto).`,
      fix: "O que fazer: conferir a classificação por função das emendas de saúde.",
      href: "/emendas?aba=conformidade",
    });
  }
  if (abaixoPisoSaude.length > 0) {
    farol.push({
      tom: "a",
      titulo: `Reserva de saúde individual: ${abaixoPisoSaude.length} autor(es) abaixo do piso`,
      texto: abaixoPisoSaude.map((a) => a.nome).slice(0, 4).join(", ") +
        (abaixoPisoSaude.length > 4 ? "…" : ""),
      fix: `Piso por autor: ${brl(c.pisoSaudeAutor!)}.`,
      href: "/emendas",
    });
  }
  if (invalidas) {
    farol.push({
      tom: "a",
      titulo: `${invalidas.qtd} emenda(s) inválida(s) para saneamento`,
      texto: `${brlCompacto(invalidas.valor)} — reprovadas pelo motor de validação.`,
      fix: "O que fazer: devolver ao autor para correção e revalidar.",
      href: "/analise",
    });
  }
  if (submetidas) {
    farol.push({
      tom: "a",
      titulo: `${submetidas.qtd} emenda(s) aguardando parecer`,
      texto: `${brlCompacto(submetidas.valor)} submetidas à tramitação.`,
      fix: "O que fazer: emitir parecer (aprovar/rejeitar) na análise técnica.",
      href: "/analise",
    });
  }
  if (params.cotaPorAutor != null) {
    farol.push(
      acimaDaCota.length === 0
        ? {
            tom: "g",
            titulo: `Cota individual respeitada — ${c.autoresComEmenda}/${c.totalAutores} autores`,
            texto: `nenhum autor ultrapassa a cota de ${brl(params.cotaPorAutor)}.`,
            href: "/emendas",
          }
        : {
            tom: "r",
            titulo: `${acimaDaCota.length} autor(es) acima da cota individual`,
            texto: acimaDaCota.map((a) => a.nome).join(", "),
            fix: `Cota: ${brl(params.cotaPorAutor)} por autor.`,
            href: "/emendas",
          }
    );
  }
  if (c.tetoGlobal != null) {
    farol.push(
      c.valor <= c.tetoGlobal + 0.5
        ? {
            tom: "g",
            titulo: "Teto global respeitado",
            texto: `soma das ${c.qtd} emendas = ${brlCompacto(c.valor)} · teto ${brlCompacto(c.tetoGlobal)}.`,
            href: "/placar",
          }
        : {
            tom: "r",
            titulo: "Teto global ultrapassado",
            texto: `soma ${brlCompacto(c.valor)} × teto ${brlCompacto(c.tetoGlobal)}.`,
            href: "/placar",
          }
    );
  }
  if (!saudeAbaixo && c.pisoSaudeGlobal != null) {
    farol.push({
      tom: "g",
      titulo: "Reserva de saúde cumprida",
      texto: `Saúde ${brlCompacto(c.valorSaude)} ≥ piso ${brlCompacto(c.pisoSaudeGlobal)}.`,
      href: "/placar",
    });
  }

  const pctSaude = c.valor > 0 ? Math.round((c.valorSaude / c.valor) * 100) : 0;
  const emAnalise = (invalidas?.qtd ?? 0) + (submetidas?.qtd ?? 0);

  return (
    <div>
      {saudeAbaixo ? (
        <Banner
          tom="warn"
          emoji="⚠️"
          href="/emendas?aba=conformidade"
          tag={<Tag360 tom="warn">conferir classificação</Tag360>}
        >
          <b>
            Reserva da saúde {brlCompacto(c.pisoSaudeGlobal! - c.valorSaude)}{" "}
            abaixo do piso ({params.reservaSaudePct}%)
          </b>{" "}
          · conferir a classificação por função · <u>ver e conferir →</u>
        </Banner>
      ) : null}
      <Banner
        tom="roxo"
        emoji="🚀"
        href="/tramitacao"
        tag={
          <Tag360 tom="roxo">
            {brlCompacto(c.valor)}
            {c.tetoGlobal
              ? ` · ${Math.round((c.valor / c.tetoGlobal) * 100)}% do teto`
              : ""}
          </Tag360>
        }
      >
        <b>
          {c.qtd} emendas apresentadas por {c.autoresComEmenda} autor(es)
        </b>{" "}
        · <u>ver a tramitação →</u>
      </Banner>

      <SecTitle
        titulo={tituloPainel}
        nota={`emendas do exercício ${ano} · consolidado a partir das emendas registradas`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {params.rcl != null ? (
          <KpiCard
            eyebrow="RCL (base)"
            numero={brlCompacto(params.rcl)}
            rotulo="receita corrente líquida · parâmetro"
            delta={{ tom: "neutral", texto: "base do cálculo impositivo" }}
          />
        ) : (
          <KpiCard
            eyebrow="Exercício"
            numero={String(ano)}
            rotulo="contexto ativo da plataforma"
            delta={{ tom: "neutral", texto: "troque na topbar" }}
          />
        )}
        <KpiCard
          eyebrow={
            params.percentualImpositivo != null
              ? `Teto impositivo (${params.percentualImpositivo}%)`
              : "Teto global"
          }
          numero={c.tetoGlobal != null ? brlCompacto(c.tetoGlobal) : "—"}
          rotulo={
            c.tetoGlobal != null
              ? `${brl(c.tetoGlobal)} · cota × ${c.totalAutores} autores`
              : "defina TETO_VALOR_AUTOR nas configurações"
          }
          delta={
            c.tetoGlobal != null
              ? { tom: "up", texto: "soma das cotas individuais" }
              : undefined
          }
          href="/placar"
        />
        <KpiCard
          eyebrow="Cota por autor"
          numero={
            params.cotaPorAutor != null ? brlCompacto(params.cotaPorAutor) : "—"
          }
          rotulo={
            params.cotaPorAutor != null
              ? `${brl(params.cotaPorAutor)} · ${c.totalAutores} autores`
              : "parâmetro TETO_VALOR_AUTOR"
          }
          delta={
            c.pisoSaudeAutor != null
              ? {
                  tom: "neutral",
                  texto: `${brlCompacto(c.pisoSaudeAutor)} mínimos em saúde`,
                }
              : undefined
          }
        />
        <KpiCard
          eyebrow="Emendas apresentadas"
          numero={String(c.qtd)}
          rotulo={`itens · Saúde ${c.qtdSaude} · Demais ${c.qtdDemais}`}
          delta={{ tom: "up", texto: `${c.autoresComEmenda} autores` }}
          href="/emendas"
        />
        <KpiCard
          eyebrow="Reserva da saúde"
          numero={`${pctSaude}%`}
          rotulo={
            c.pisoSaudeGlobal != null
              ? `${brlCompacto(c.valorSaude)} · piso ${params.reservaSaudePct}% (${brlCompacto(c.pisoSaudeGlobal)})`
              : `${brlCompacto(c.valorSaude)} em saúde (função ${params.funcaoSaudeCodigo})`
          }
          delta={
            c.pisoSaudeGlobal != null
              ? saudeAbaixo
                ? { tom: "warn", texto: "abaixo do piso" }
                : { tom: "up", texto: "piso cumprido" }
              : undefined
          }
          href="/emendas?aba=conformidade"
        />
        <KpiCard
          variante="hi"
          eyebrow="💰 Em análise"
          numero={String(emAnalise)}
          rotulo="emendas para sanear ou dar parecer"
          delta={{ tom: "neutral", texto: "Abrir análise técnica →" }}
          href="/analise"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card360>
          <Eyebrow>Favorável × Atenção</Eyebrow>
          <h3 className="mb-3 text-[17px] font-bold">
            O farol da conferência — {c.qtd} emendas · {c.autoresComEmenda}{" "}
            autores · {brlCompacto(c.valor)}
          </h3>
          <Farol itens={farol} />
          <CardSrc direita={`exercício ${ano} · dados do banco em tempo real`}>
            checagens calculadas sobre as emendas registradas e os parâmetros de
            validação
          </CardSrc>
        </Card360>

        <div className="flex flex-col gap-4">
          <Card360 variante="dark">
            <Eyebrow escuro>✨ O que precisa fechar</Eyebrow>
            <div className="flex flex-col gap-2">
              {[
                invalidas
                  ? {
                      n: "1",
                      t: `Sanear ${invalidas.qtd} emenda(s) inválida(s)`,
                      s: "reprovadas pelo motor — devolver ao autor",
                      href: "/analise",
                    }
                  : null,
                submetidas
                  ? {
                      n: "2",
                      t: `Dar parecer em ${submetidas.qtd} emenda(s)`,
                      s: "submetidas aguardando aprovação/rejeição",
                      href: "/analise",
                    }
                  : null,
                {
                  n: "3",
                  t: "Conferir os destinos mais indicados",
                  s: porDestino
                    .slice(0, 3)
                    .map((d) => d.nome)
                    .join(", "),
                  href: "/emendas?aba=destino",
                },
              ]
                .filter(Boolean)
                .map((a) => (
                  <Link
                    key={a!.n}
                    href={a!.href}
                    className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 hover:bg-white/15"
                  >
                    <span className="grad-hi flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-brand-deep">
                      {a!.n}
                    </span>
                    <span className="min-w-0">
                      <b className="block text-[13px] text-white">{a!.t}</b>
                      <span className="block truncate text-[11.5px] text-[#b9c7e4]">
                        {a!.s}
                      </span>
                    </span>
                  </Link>
                ))}
            </div>
            <Link
              href="/assistente"
              className="grad-hi mt-3 w-fit rounded-lg px-4 py-2 text-[13px] font-bold text-brand-deep hover:brightness-105"
            >
              Perguntar ao assistente →
            </Link>
          </Card360>

          <KpiCard
            eyebrow="Resumo consolidado"
            numero={brlCompacto(c.valor)}
            rotulo={`${c.qtd} emendas · Saúde ${pctSaude}% · ${c.autoresComEmenda} autores`}
            fonte="é este resumo que fecha o parecer"
            href="/placar"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card360>
          <Eyebrow>
            Distribuição por área
            {c.tetoGlobal != null ? ` — teto ${brl(c.tetoGlobal)}` : ""}
          </Eyebrow>
          <MiniBar
            rotulo={`Saúde (função ${params.funcaoSaudeCodigo})`}
            pct={c.tetoGlobal ? (c.valorSaude / c.tetoGlobal) * 100 : pctSaude}
            valor={`${brl(c.valorSaude)} · ${c.qtdSaude} itens`}
            marcaPct={
              c.tetoGlobal && c.pisoSaudeGlobal != null
                ? (c.pisoSaudeGlobal / c.tetoGlobal) * 100
                : undefined
            }
            abaixoDaMarca={saudeAbaixo}
          />
          <MiniBar
            rotulo="Demais áreas"
            pct={
              c.tetoGlobal ? (c.valorDemais / c.tetoGlobal) * 100 : 100 - pctSaude
            }
            valor={`${brl(c.valorDemais)} · ${c.qtdDemais} itens`}
          />
          <CardSrc
            direita={
              c.pisoSaudeGlobal != null ? "marca ▎= piso da saúde" : undefined
            }
          >
            área derivada da função da dotação de cada emenda
          </CardSrc>
        </Card360>

        <Card360>
          <Eyebrow>Concentração de destinos — órgãos mais indicados</Eyebrow>
          <p className="mb-2 text-xs text-muted-foreground">
            Poucos órgãos concentram muitas emendas de vários autores. Conferir
            a <b>capacidade de execução</b> antes da consolidação.
          </p>
          {porDestino.slice(0, 6).map((d) => (
            <MiniBar
              key={d.nome}
              rotulo={d.nome}
              larguraRotulo={210}
              pct={porDestino[0].valor > 0 ? (d.valor / porDestino[0].valor) * 100 : 0}
              valor={`${brlCompacto(d.valor)} · ${d.itens}x`}
            />
          ))}
          <CardSrc direita={`exercício ${ano}`}>
            {c.qtd} itens agregados por órgão da dotação
          </CardSrc>
        </Card360>
      </div>

      <SecTitle
        titulo="Emendas por autor — cota, reserva da saúde e conformidade"
        nota={
          params.cotaPorAutor != null
            ? `cota individual de ${brl(params.cotaPorAutor)} · clique na linha para abrir o detalhe`
            : "clique na linha para abrir o detalhe"
        }
      />
      <Card360>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr>
                {["Autor", "Itens", "Saúde", "Demais", "Total", "Situação"].map(
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
              {porAutor.map((a) => {
                const saudeOk =
                  c.pisoSaudeAutor == null || a.valorSaude >= c.pisoSaudeAutor - 0.5;
                const cotaOk =
                  params.cotaPorAutor == null ||
                  a.valorTotal <= params.cotaPorAutor + 0.5;
                return (
                  <tr key={a.autorId} className="group">
                    <td className="border-b border-border px-2.5 py-2 font-bold">
                      <Link
                        href={`/vereador360?autor=${a.autorId}`}
                        className="hover:text-brand-cyan hover:underline"
                      >
                        {a.nome}
                      </Link>
                    </td>
                    <td className="border-b border-border px-2.5 py-2">{a.itens}</td>
                    <td className="border-b border-border px-2.5 py-2 tabular-nums">
                      {brl(a.valorSaude)}
                    </td>
                    <td className="border-b border-border px-2.5 py-2 tabular-nums">
                      {brl(a.valorDemais)}
                    </td>
                    <td className="border-b border-border px-2.5 py-2 font-semibold tabular-nums">
                      {brl(a.valorTotal)}
                    </td>
                    <td className="border-b border-border px-2.5 py-2">
                      {!cotaOk ? (
                        <Tag360 tom="bad">acima da cota</Tag360>
                      ) : !saudeOk ? (
                        <Tag360 tom="warn">saúde abaixo do piso</Tag360>
                      ) : (
                        <Tag360 tom="ok">conforme</Tag360>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <CardSrc
          direita={
            c.pisoSaudeAutor != null
              ? `reserva mínima de saúde por autor: ${brl(c.pisoSaudeAutor)}`
              : undefined
          }
        >
          agregado por autor · situação:{" "}
          {porStatus
            .map((s) => `${ROTULO_STATUS_EMENDA[s.status] ?? s.status} ${s.qtd}`)
            .join(" · ")}
        </CardSrc>
      </Card360>
    </div>
  );
}
