import { getAnoAtivo } from "@/lib/exercicio";
import { getDados360, brlCompacto } from "@/lib/queries-360";
import { getInstrumentoBaseAberto } from "@/lib/queries-orcamento";
import { ROTULO_TIPO_INSTRUMENTO } from "@/lib/rotulos";
import { SecTitle } from "@/components/e360/sec-title";
import { KpiCard } from "@/components/e360/kpi-card";
import { Card360, CardSrc } from "@/components/e360/card360";
import { Flow360, type EtapaFluxo } from "@/components/e360/flow360";

export default async function TramitacaoPage() {
  const ano = await getAnoAtivo();
  const [{ consolidado: c, porStatus }, base] = await Promise.all([
    getDados360(ano),
    getInstrumentoBaseAberto(ano),
  ]);

  const qtd = (s: string) => porStatus.find((x) => x.status === s)?.qtd ?? 0;
  const rascunhos = qtd("RASCUNHO") + qtd("EM_VALIDACAO");
  const invalidas = qtd("INVALIDA");
  const validas = qtd("VALIDA");
  const submetidas = qtd("SUBMETIDA") + qtd("EM_TRAMITACAO");
  const decididas = qtd("APROVADA") + qtd("REJEITADA");

  // Etapa atual do processo, derivada do que existe no banco.
  const etapaAtual =
    decididas > 0 && submetidas === 0 && validas === 0 && rascunhos === 0
      ? "consolidacao"
      : submetidas > 0
        ? "parecer"
        : validas > 0 || invalidas > 0
          ? "conferencia"
          : c.qtd > 0
            ? "apresentacao"
            : "abertura";

  const ordem = ["abertura", "apresentacao", "conferencia", "parecer", "consolidacao"];
  const estado = (etapa: string): EtapaFluxo["estado"] => {
    const i = ordem.indexOf(etapa);
    const atual = ordem.indexOf(etapaAtual);
    return i < atual ? "done" : i === atual ? "now" : "next";
  };

  const antes: EtapaFluxo[] = [
    {
      titulo: "Recebimento do projeto de lei",
      subtitulo: base
        ? `${ROTULO_TIPO_INSTRUMENTO[base.tipo]} ${base.numero} · base das emendas`
        : "aguardando projeto de lei base",
      estado: base ? "done" : "next",
      href: "/executivo/planejamento/instrumentos",
    },
    {
      titulo: "Abertura do período de emendas",
      subtitulo: base ? "projeto de lei em tramitação — emendas abertas" : "—",
      estado: base ? "done" : "next",
    },
    {
      titulo: "Apresentação das emendas",
      subtitulo: `${c.qtd} emendas · ${c.autoresComEmenda} autores · ${brlCompacto(c.valor)}`,
      estado: c.qtd > 0 ? (etapaAtual === "apresentacao" ? "now" : "done") : "next",
      href: "/emendas",
    },
    {
      titulo: "Conferência formal (motor de validação)",
      subtitulo: `${validas} válidas · ${invalidas} inválidas · ${rascunhos} em elaboração`,
      estado: estado("conferencia"),
      href: "/analise",
    },
  ];

  const depois: EtapaFluxo[] = [
    {
      titulo: "Análise técnica e parecer",
      subtitulo: `${submetidas} submetidas aguardando parecer`,
      estado: estado("parecer"),
      href: "/analise",
    },
    {
      titulo: "Deliberação e lei aprovada",
      subtitulo: `${decididas} emendas com decisão (aprovadas/rejeitadas)`,
      estado: estado("consolidacao"),
      href: "/legislativo/tramitacao/acatadas",
    },
    {
      titulo: "Consolidação e acompanhamento",
      subtitulo: "comparação PL × lei aprovada e execução",
      estado: estado("consolidacao"),
      href: "/executivo/acompanhamento",
    },
  ];

  return (
    <div>
      <SecTitle
        titulo={`Tramitação das emendas${base ? ` ao ${ROTULO_TIPO_INSTRUMENTO[base.tipo]} ${base.numero}` : ""}`}
        nota={`o caminho da emenda, do recebimento do projeto à consolidação · exercício ${ano ?? "—"} · clique em cada etapa`}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          eyebrow="Emendas apresentadas"
          numero={String(c.qtd)}
          rotulo={`por ${c.autoresComEmenda} autor(es) · ${brlCompacto(c.valor)}`}
          href="/emendas"
        />
        <KpiCard
          eyebrow="Conferência formal"
          numero={invalidas === 0 && c.qtd > 0 ? "OK" : `${invalidas} p/ sanear`}
          rotulo={`${validas} válidas pelo motor · ${invalidas} inválidas`}
          delta={
            invalidas > 0
              ? { tom: "warn", texto: "devolver p/ saneamento" }
              : { tom: "up", texto: "sem pendências" }
          }
          href="/analise"
        />
        <KpiCard
          eyebrow="Aguardando parecer"
          numero={String(submetidas)}
          rotulo="submetidas à análise técnica"
          href="/analise"
        />
        <KpiCard
          eyebrow="Etapa atual"
          numero={
            {
              abertura: "Abertura",
              apresentacao: "Apresentação",
              conferencia: "Conferência",
              parecer: "Análise técnica",
              consolidacao: "Consolidação",
            }[etapaAtual]!
          }
          rotulo="derivada da situação real das emendas"
        />
      </div>

      <Card360>
        <Flow360
          antes={antes}
          depois={depois}
          decisao={{
            titulo: "Conformidade OK?",
            devolucao: "Devolver p/ saneamento",
            devolucaoHref: "/analise",
          }}
        />
        <CardSrc direita="situação calculada a partir dos status reais das emendas">
          fluxo regimental: apresentação → conferência → análise → deliberação →
          consolidação
        </CardSrc>
      </Card360>
    </div>
  );
}
