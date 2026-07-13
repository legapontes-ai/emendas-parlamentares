import Link from "next/link";
import { cn } from "@/lib/utils";
import { Role } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/session";
import { getAnoAtivo } from "@/lib/exercicio";
import {
  getDados360,
  listarAutores,
  ehSaude,
  brl,
  brlCompacto,
} from "@/lib/queries-360";
import { ROTULO_STATUS_EMENDA } from "@/lib/rotulos";
import { SecTitle } from "@/components/e360/sec-title";
import { KpiCard } from "@/components/e360/kpi-card";
import { Card360, CardSrc, Eyebrow } from "@/components/e360/card360";
import { Farol, type FarolItemDado } from "@/components/e360/farol";
import { Tag360, tomDoStatus } from "@/components/e360/tag360";
import { EmptyState } from "@/components/empty-state";

export default async function Vereador360Page({
  searchParams,
}: {
  searchParams: Promise<{ autor?: string }>;
}) {
  const { autor: autorParam } = await searchParams;
  const user = await getCurrentUser();
  const ano = await getAnoAtivo();
  const [{ params, emendas, consolidado: c, porAutor }, autores] =
    await Promise.all([getDados360(ano), listarAutores()]);

  // O gabinete (LEG_AUTOR) vê sempre a própria cota; demais escolhem por chip.
  const autorProprio = autores.find((a) => a.usuarioId === user.id);
  const travadoNoProprio = user.role === Role.LEG_AUTOR && !!autorProprio;
  const selecionado = travadoNoProprio
    ? autorProprio
    : (autores.find((a) => a.id === autorParam) ??
      autores.find((a) => porAutor.some((r) => r.autorId === a.id)) ??
      autores[0]);

  if (!selecionado) {
    return (
      <div>
        <SecTitle titulo="Vereador 360" nota="detalhamento da cota por autor" />
        <EmptyState
          titulo="Nenhum autor cadastrado"
          descricao="Cadastre autores (vereadores) para acompanhar cota, reserva de saúde e itens."
        />
      </div>
    );
  }

  const resumo = porAutor.find((r) => r.autorId === selecionado.id);
  const itens = emendas.filter((e) => e.autorId === selecionado.id);
  const cotaOk =
    params.cotaPorAutor == null ||
    (resumo?.valorTotal ?? 0) <= params.cotaPorAutor + 0.5;
  const saudeOk =
    c.pisoSaudeAutor == null || (resumo?.valorSaude ?? 0) >= c.pisoSaudeAutor - 0.5;

  const farol: FarolItemDado[] = [
    params.cotaPorAutor != null
      ? {
          tom: cotaOk ? "g" : "r",
          titulo: cotaOk ? "Cota dentro do limite" : "Cota ultrapassada",
          texto: `${brl(resumo?.valorTotal ?? 0)} de ${brl(params.cotaPorAutor)} (${Math.round(((resumo?.valorTotal ?? 0) / params.cotaPorAutor) * 100)}%)`,
        }
      : {
          tom: "a" as const,
          titulo: "Cota não configurada",
          texto: "defina o parâmetro TETO_VALOR_AUTOR nas Configurações",
        },
    c.pisoSaudeAutor != null
      ? {
          tom: saudeOk ? "g" : "a",
          titulo: "Reserva de saúde",
          texto: `${brl(resumo?.valorSaude ?? 0)}${saudeOk ? " — cumpre o piso de " : " — abaixo do piso de "}${brl(c.pisoSaudeAutor)}`,
        }
      : {
          tom: "g" as const,
          titulo: "Saúde",
          texto: `${brl(resumo?.valorSaude ?? 0)} em ${resumo?.itensSaude ?? 0} item(ns) (função ${params.funcaoSaudeCodigo})`,
        },
    {
      tom: "g",
      titulo: "Itens apresentados",
      texto: `${itens.length} emenda(s) registrada(s) no exercício ${ano ?? "—"}`,
    },
  ];

  return (
    <div>
      <SecTitle
        titulo={`Vereador 360 — ${selecionado.nome}`}
        nota={
          params.cotaPorAutor != null
            ? `cota ${brl(params.cotaPorAutor)} · ${itens.length} itens · Saúde ${brl(resumo?.valorSaude ?? 0)} · Demais ${brl(resumo?.valorDemais ?? 0)}`
            : `${itens.length} itens no exercício ${ano ?? "—"}`
        }
      />

      {!travadoNoProprio ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold">Autor:</span>
          {autores.map((a) => (
            <Link
              key={a.id}
              href={`/vereador360?autor=${a.id}`}
              className={cn(
                "rounded-full border-[1.5px] px-3.5 py-1 text-xs font-semibold transition-colors",
                a.id === selecionado.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-brand-cyan hover:text-foreground"
              )}
            >
              {a.nome}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          eyebrow="Cota utilizada"
          numero={brlCompacto(resumo?.valorTotal ?? 0)}
          rotulo={
            params.cotaPorAutor != null
              ? `de ${brl(params.cotaPorAutor)} disponíveis`
              : "total das emendas do autor"
          }
          delta={
            params.cotaPorAutor != null
              ? cotaOk
                ? {
                    tom: "up",
                    texto: `${Math.round(((resumo?.valorTotal ?? 0) / params.cotaPorAutor) * 100)}% da cota`,
                  }
                : { tom: "down", texto: "cota ultrapassada" }
              : undefined
          }
        />
        <KpiCard
          eyebrow="Itens"
          numero={String(itens.length)}
          rotulo="indicações apresentadas"
        />
        <KpiCard
          eyebrow="Saúde"
          numero={brlCompacto(resumo?.valorSaude ?? 0)}
          rotulo={`${resumo?.itensSaude ?? 0} item(ns) · função ${params.funcaoSaudeCodigo}`}
          delta={
            c.pisoSaudeAutor != null
              ? saudeOk
                ? { tom: "up", texto: "cumpre o piso" }
                : { tom: "warn", texto: "abaixo do piso" }
              : undefined
          }
        />
        <KpiCard
          eyebrow="Demais áreas"
          numero={brlCompacto(resumo?.valorDemais ?? 0)}
          rotulo={`${(resumo?.itens ?? 0) - (resumo?.itensSaude ?? 0)} item(ns)`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card360>
          <Eyebrow>Itens da cota — objeto, destino e valor</Eyebrow>
          {itens.length === 0 ? (
            <EmptyState
              titulo="Nenhuma emenda deste autor no exercício"
              acao={
                travadoNoProprio ? (
                  <Link
                    href="/legislativo/emendas/nova"
                    className="text-sm font-bold text-brand-cyan hover:underline"
                  >
                    Apresentar emenda →
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    {["Área", "Objeto / destino", "Situação", "Valor"].map((h) => (
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
                  {itens.map((e) => (
                    <tr key={e.id}>
                      <td className="border-b border-border px-2.5 py-2">
                        <Tag360 tom={ehSaude(e, params) ? "ok" : "pend"}>
                          {ehSaude(e, params) ? "Saúde" : e.funcaoNome}
                        </Tag360>
                      </td>
                      <td className="border-b border-border px-2.5 py-2">
                        <Link
                          href={`/legislativo/emendas/${e.id}`}
                          className="font-medium hover:text-brand-cyan hover:underline"
                        >
                          {e.objeto}
                        </Link>
                        <span className="block text-[11.5px] text-muted-foreground">
                          {e.orgaoNome} · {e.unidadeNome}
                        </span>
                      </td>
                      <td className="border-b border-border px-2.5 py-2">
                        <Tag360 tom={tomDoStatus(e.status)}>
                          {ROTULO_STATUS_EMENDA[e.status] ?? e.status}
                        </Tag360>
                      </td>
                      <td className="border-b border-border px-2.5 py-2 font-semibold tabular-nums">
                        {brl(e.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <CardSrc direita={`exercício ${ano ?? "—"}`}>
            emendas do autor · clique no objeto para o detalhe completo com o
            relatório de validação
          </CardSrc>
        </Card360>

        <Card360>
          <Eyebrow>Farol do autor</Eyebrow>
          <Farol itens={farol} />
          <CardSrc>conferência de cota e reserva da saúde</CardSrc>
        </Card360>
      </div>
    </div>
  );
}
