import Link from "next/link";
import { getAnoAtivo } from "@/lib/exercicio";
import { getDados360, brl, brlCompacto } from "@/lib/queries-360";
import { SecTitle } from "@/components/e360/sec-title";
import { Card360, Eyebrow } from "@/components/e360/card360";
import {
  ChatAssistente,
  type PerguntaResposta,
} from "@/components/e360/chat-assistente";

export default async function AssistentePage() {
  const ano = await getAnoAtivo();
  const { params, consolidado: c, porAutor, porDestino } =
    await getDados360(ano);

  // Respostas calculadas no servidor sobre o banco — sempre com fonte.
  const qa: PerguntaResposta[] = [
    {
      pergunta: "Qual o teto e como é dividido?",
      resposta:
        c.tetoGlobal != null
          ? `O teto global é <b>${brl(c.tetoGlobal)}</b> — cota de <b>${brl(params.cotaPorAutor!)}</b> × ${c.totalAutores} autores.${
              c.pisoSaudeGlobal != null
                ? ` Reserva mínima de saúde: <b>${brl(c.pisoSaudeGlobal)}</b> (${params.reservaSaudePct}%).`
                : ""
            }`
          : "O teto global ainda não está configurado — defina o parâmetro <b>TETO_VALOR_AUTOR</b> (e opcionalmente <b>RESERVA_SAUDE_PERCENTUAL</b>) nas Configurações.",
      fonte: "parâmetros de validação",
    },
    {
      pergunta: "A reserva da saúde está sendo respeitada?",
      resposta:
        c.limiteDemaisGlobal != null
          ? c.valorDemais <= c.limiteDemaisGlobal + 0.5
            ? `Sim: apresentar emenda é faculdade — a regra é o limite, e ele está respeitado. As demais áreas somam <b>${brl(c.valorDemais)}</b>, dentro do limite de <b>${brl(c.limiteDemaisGlobal)}</b>; os <b>${brl(c.pisoSaudeGlobal!)}</b> da reserva seguem disponíveis só para a saúde (em saúde até agora: ${brl(c.valorSaude)}).`
            : `Não: as demais áreas somam <b>${brl(c.valorDemais)}</b>, <b>${brl(c.valorDemais - c.limiteDemaisGlobal)} acima</b> do limite de ${brl(c.limiteDemaisGlobal)} — a reserva da saúde está sendo usada em outras áreas. Reclassificar ou reduzir emendas de outras áreas.`
          : `Há <b>${brl(c.valorSaude)}</b> em Saúde (função ${params.funcaoSaudeCodigo}), ${c.qtdSaude} itens. Para ativar a checagem da reserva, defina o parâmetro RESERVA_SAUDE_PERCENTUAL.`,
      fonte: "emendas × função da dotação · reserva como limite",
    },
    {
      pergunta: "Quais os maiores destinos?",
      resposta:
        porDestino.length > 0
          ? "Por valor agregado: " +
            porDestino
              .slice(0, 5)
              .map((d) => `<b>${d.nome}</b> (${brlCompacto(d.valor)}, ${d.itens} emendas)`)
              .join(", ") +
            ". Vale conferir a capacidade de execução dos mais indicados."
          : "Ainda não há emendas registradas no exercício.",
      fonte: "agregado por órgão da dotação",
    },
    {
      pergunta: "Como está o uso da cota pelos autores?",
      resposta:
        params.cotaPorAutor != null && porAutor.length > 0
          ? `${porAutor.length} autor(es) apresentaram emendas somando <b>${brl(c.valor)}</b>. ` +
            porAutor
              .slice(0, 6)
              .map(
                (a) =>
                  `${a.nome}: ${Math.round((a.valorTotal / params.cotaPorAutor!) * 100)}%`
              )
              .join(" · ") +
            (porAutor.length > 6 ? " · …" : "") +
            ". Detalhe por autor no Vereador 360."
          : porAutor.length > 0
            ? `${porAutor.length} autor(es) com emendas, somando <b>${brl(c.valor)}</b>. Defina a cota (TETO_VALOR_AUTOR) para acompanhar o percentual de uso.`
            : "Ainda não há emendas registradas no exercício.",
      fonte: "agregado por autor",
    },
  ];

  return (
    <div>
      <SecTitle
        titulo="Assistente"
        nota={`pergunte em português · responde com os dados reais do exercício ${ano ?? "—"} e cita a fonte`}
      />
      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-4">
          <Card360 variante="dark">
            <Eyebrow escuro>Guardrails</Eyebrow>
            <p className="font-serif text-[14.5px] leading-relaxed">
              Só afirma o que o dado sustenta — sempre com fonte. E a linha
              vermelha: <b>nunca decide o mérito nem cria despesa</b>. A
              plataforma confere requisitos formais e organiza; a decisão e a
              assinatura são do relator e da comissão.
            </p>
          </Card360>
          <Card360>
            <Eyebrow>O que ele faz</Eyebrow>
            <p className="text-[13px] leading-7">
              • Confere cota individual, teto e reserva de saúde
              <br />• Agrega por autor, área e destino
              <br />• Aponta o que precisa de saneamento
              <br />• Prepara o resumo consolidado
            </p>
          </Card360>
          <Link href="/analise" className="group">
            <Card360 className="transition-all duration-150 group-hover:-translate-y-0.5 group-hover:ring-brand-cyan">
              <Eyebrow>Camada de validação do relator</Eyebrow>
              <p className="text-[13px]">
                Motor confere → relator revisa → decide. A decisão é sempre de
                um parlamentar.
              </p>
              <span className="mt-2 text-[11px] font-bold text-brand-cyan">
                ver detalhe →
              </span>
            </Card360>
          </Link>
        </div>
        <ChatAssistente qa={qa} />
      </div>
    </div>
  );
}
