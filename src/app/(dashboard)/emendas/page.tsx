import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getAnoAtivo } from "@/lib/exercicio";
import { getDados360, brl, brlCompacto } from "@/lib/queries-360";
import { ROTULO_STATUS_EMENDA } from "@/lib/rotulos";
import { SecTitle } from "@/components/e360/sec-title";
import { KpiCard } from "@/components/e360/kpi-card";
import { Card360, CardSrc, Eyebrow } from "@/components/e360/card360";
import { Farol, type FarolItemDado } from "@/components/e360/farol";
import { Banner } from "@/components/e360/banner";
import { Subtabs } from "@/components/e360/subtabs";
import { Tag360 } from "@/components/e360/tag360";
import { Role } from "@/generated/prisma/enums";

const ABAS = [
  { id: "vereador", titulo: "Por autor" },
  { id: "destino", titulo: "Por destino" },
  { id: "conformidade", titulo: "Conformidade" },
];

export default async function EmendasVistaPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba: abaParam } = await searchParams;
  const aba = ABAS.some((a) => a.id === abaParam) ? abaParam! : "vereador";
  const user = await getCurrentUser();
  const ano = await getAnoAtivo();
  const {
    params,
    consolidado: c,
    porAutor,
    porDestino,
    porStatus,
  } = await getDados360(ano);

  const podeApresentar = (
    [Role.LEG_ADMIN, Role.LEG_TECNICO, Role.LEG_AUTOR, Role.SUPER_ADMIN] as Role[]
  ).includes(user.role);

  const pctSaude = c.valor > 0 ? Math.round((c.valorSaude / c.valor) * 100) : 0;
  const invalidas = porStatus.find((s) => s.status === "INVALIDA");
  const saudeAbaixo =
    c.pisoSaudeGlobal != null && c.valorSaude < c.pisoSaudeGlobal;

  return (
    <div>
      <SecTitle
        titulo="Emendas & Beneficiários"
        nota={`${c.qtd} emendas · ${brlCompacto(c.valor)} · por autor, por destino e conformidade · exercício ${ano ?? "—"}`}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Subtabs base="/emendas" abas={ABAS} ativa={aba} />
        {podeApresentar ? (
          <Link
            href="/legislativo/emendas/nova"
            className="grad-main mb-4 rounded-lg px-4 py-2 text-[13px] font-bold text-white hover:brightness-110"
          >
            + Nova emenda
          </Link>
        ) : null}
      </div>

      {aba === "vereador" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              eyebrow="Emendas"
              numero={String(c.qtd)}
              rotulo={`itens apresentados · ${c.autoresComEmenda} autores`}
            />
            <KpiCard
              eyebrow="Valor total"
              numero={brlCompacto(c.valor)}
              rotulo={
                c.tetoGlobal
                  ? `${Math.round((c.valor / c.tetoGlobal) * 100)}% do teto global`
                  : "soma das emendas"
              }
            />
            <KpiCard
              eyebrow="Saúde"
              numero={brlCompacto(c.valorSaude)}
              rotulo={`${c.qtdSaude} itens · ${pctSaude}% do total`}
              delta={
                c.pisoSaudeGlobal != null
                  ? saudeAbaixo
                    ? { tom: "warn", texto: "abaixo do piso" }
                    : { tom: "up", texto: "piso cumprido" }
                  : undefined
              }
            />
            <KpiCard
              eyebrow="Demais áreas"
              numero={brlCompacto(c.valorDemais)}
              rotulo={`${c.qtdDemais} itens · ${100 - pctSaude}% do total`}
            />
          </div>

          <Card360 className="mt-4">
            <Eyebrow>Emendas por autor (clique para abrir o Vereador 360)</Eyebrow>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    {["Autor", "Itens", "Saúde", "Demais", "Total", "Cota"].map((h) => (
                      <th
                        key={h}
                        className="border-b-2 border-border px-2.5 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {porAutor.map((a) => (
                    <tr key={a.autorId}>
                      <td className="border-b border-border px-2.5 py-2 font-bold">
                        <Link
                          href={`/vereador360?autor=${a.autorId}`}
                          className="hover:text-brand-cyan hover:underline"
                        >
                          {a.nome} ›
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
                        {params.cotaPorAutor == null ? (
                          <Tag360 tom="pend">sem cota definida</Tag360>
                        ) : a.valorTotal > params.cotaPorAutor + 0.5 ? (
                          <Tag360 tom="bad">acima da cota</Tag360>
                        ) : (
                          <Tag360 tom="ok">
                            {Math.round((a.valorTotal / params.cotaPorAutor) * 100)}% da
                            cota
                          </Tag360>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CardSrc
              direita={
                params.cotaPorAutor != null
                  ? `cota individual ${brl(params.cotaPorAutor)}`
                  : undefined
              }
            >
              agregado das emendas do exercício por autor
            </CardSrc>
          </Card360>
        </>
      ) : null}

      {aba === "destino" ? (
        <Card360>
          <Eyebrow>Destinos — órgãos indicados pelas emendas</Eyebrow>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Órgão / destino", "Emendas", "Em saúde", "Valor total", "Participação"].map(
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
                {porDestino.map((d) => (
                  <tr key={d.nome}>
                    <td className="border-b border-border px-2.5 py-2 font-bold">
                      {d.nome}
                    </td>
                    <td className="border-b border-border px-2.5 py-2">{d.itens}</td>
                    <td className="border-b border-border px-2.5 py-2 tabular-nums">
                      {brl(d.valorSaude)}
                    </td>
                    <td className="border-b border-border px-2.5 py-2 font-semibold tabular-nums">
                      {brl(d.valor)}
                    </td>
                    <td className="border-b border-border px-2.5 py-2">
                      <Tag360 tom="info">
                        {c.valor > 0 ? ((d.valor / c.valor) * 100).toFixed(1) : "0"}% do
                        total
                      </Tag360>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CardSrc direita={`exercício ${ano ?? "—"}`}>
            {c.qtd} itens agregados pelo órgão da dotação · entidades muito
            indicadas merecem conferência de capacidade de execução
          </CardSrc>
        </Card360>
      ) : null}

      {aba === "conformidade" ? (
        <>
          {invalidas || saudeAbaixo ? (
            <Banner tom="warn" emoji="🧾" href="/analise">
              <b>
                {[
                  invalidas ? `${invalidas.qtd} emenda(s) inválida(s) para saneamento` : null,
                  saudeAbaixo ? "reserva de saúde abaixo do piso" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </b>{" "}
              · <u>abrir análise técnica →</u>
            </Banner>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card360>
              <Eyebrow>Checagens automáticas — visão geral</Eyebrow>
              <Farol
                itens={
                  [
                    params.cotaPorAutor != null
                      ? ({
                          tom: porAutor.some(
                            (a) => a.valorTotal > params.cotaPorAutor! + 0.5
                          )
                            ? "r"
                            : "g",
                          titulo: "Cota individual por autor",
                          texto: `cota de ${brl(params.cotaPorAutor)} · ${porAutor.length} autores com emendas`,
                        } as FarolItemDado)
                      : null,
                    c.tetoGlobal != null
                      ? ({
                          tom: c.valor <= c.tetoGlobal + 0.5 ? "g" : "r",
                          titulo: "Teto global",
                          texto: `soma ${brlCompacto(c.valor)} · teto ${brlCompacto(c.tetoGlobal)}`,
                        } as FarolItemDado)
                      : null,
                    c.pisoSaudeGlobal != null
                      ? ({
                          tom: saudeAbaixo ? "a" : "g",
                          titulo: "Reserva de saúde",
                          texto: `${brlCompacto(c.valorSaude)} × piso ${brlCompacto(c.pisoSaudeGlobal)}`,
                        } as FarolItemDado)
                      : null,
                    ...porStatus
                      .filter((s) => ["INVALIDA", "SUBMETIDA"].includes(s.status))
                      .map(
                        (s) =>
                          ({
                            tom: "a",
                            titulo: `${s.qtd} emenda(s) ${ROTULO_STATUS_EMENDA[s.status].toLowerCase()}(s)`,
                            texto: brlCompacto(s.valor),
                            href: "/analise",
                          }) as FarolItemDado
                      ),
                  ].filter(Boolean) as FarolItemDado[]
                }
              />
              <CardSrc>
                checagens do motor: cota, teto, base do instrumento, PPA/LDO —
                relatório completo por emenda na análise técnica
              </CardSrc>
            </Card360>
            <Card360 variante="mesa">
              <Eyebrow className="text-[#b97a0b]">
                Pontos de atenção para o parecer
              </Eyebrow>
              <p className="text-[13px] leading-7">
                • <b>Reserva de saúde</b>: conferir a função da dotação (função{" "}
                {params.funcaoSaudeCodigo} = Saúde) antes da consolidação.
                <br />• <b>Concentração</b>:{" "}
                {porDestino
                  .slice(0, 3)
                  .map((d) => d.nome)
                  .join(", ")}{" "}
                concentram as maiores somas — conferir capacidade de execução.
                <br />• <b>Subvenções/auxílios a entidades</b>: exigem lei
                autorizativa, plano de trabalho e prestação de contas.
                <br />• <b>Situação das emendas</b>:{" "}
                {porStatus
                  .map((s) => `${ROTULO_STATUS_EMENDA[s.status] ?? s.status} ${s.qtd}`)
                  .join(" · ")}
                .
              </p>
              <CardSrc>
                base: LC 101/2000 (LRF) · Lei 4.320/64 · Lei Orgânica · confira a
                norma local nas Configurações
              </CardSrc>
            </Card360>
          </div>
        </>
      ) : null}

      <div className="mt-4 text-[13px]">
        <span className="text-muted-foreground">Ferramentas: </span>
        <Link href="/legislativo/emendas/minhas" className="font-bold text-brand-cyan hover:underline">
          Minhas emendas
        </Link>
        <span className="text-muted-foreground"> · </span>
        <Link href="/legislativo/emendas/todas" className="font-bold text-brand-cyan hover:underline">
          Todas as emendas (filtros e exportação)
        </Link>
      </div>
    </div>
  );
}
