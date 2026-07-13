import Link from "next/link";
import { getAnoAtivo } from "@/lib/exercicio";
import { getDados360, brlCompacto } from "@/lib/queries-360";
import { LogoEmendas360 } from "@/components/logo-emendas360";
import { SecTitle } from "@/components/e360/sec-title";
import { KpiCard } from "@/components/e360/kpi-card";
import { Card360, CardSrc, Eyebrow } from "@/components/e360/card360";
import { Farol } from "@/components/e360/farol";
import { Banner } from "@/components/e360/banner";

// Visão pública (persona "Cidadão" do mockup): as emendas dos vereadores em
// linguagem simples, sem login. Somente agregados — nenhum dado pessoal.
export default async function PublicaPage() {
  const ano = await getAnoAtivo();
  const { params, consolidado: c, porDestino } = await getDados360(ano);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="grad-dark text-white shadow-[0_2px_14px_rgba(6,24,64,.35)]">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-5">
          <LogoEmendas360 />
          <Link
            href="/login"
            className="ml-auto rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#d6e2f7] hover:bg-white/20"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-5 pb-16 pt-6">
        <Banner tom="ok" emoji="👋">
          <b>Você está vendo como o cidadão vê</b> — as emendas dos vereadores
          ao orçamento em linguagem simples. Valores reais, apresentados de
          forma acessível.
        </Banner>

        <SecTitle
          titulo={`Emendas dos vereadores — exercício ${ano ?? "—"}`}
          nota="orçamento impositivo municipal"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            eyebrow="Quanto os vereadores destinam"
            numero={brlCompacto(c.valor)}
            rotulo={`${c.qtd} emendas apresentadas viram investimentos no município`}
          />
          <KpiCard
            eyebrow="Para a saúde"
            numero={brlCompacto(c.valorSaude)}
            rotulo={`${c.qtdSaude} emendas para hospitais, UBS e serviços de saúde`}
          />
          <KpiCard
            eyebrow="Cada vereador"
            numero={
              params.cotaPorAutor != null ? brlCompacto(params.cotaPorAutor) : "—"
            }
            rotulo={`é a cota de cada um dos ${c.totalAutores} vereadores`}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card360>
            <Eyebrow>Para onde vai o dinheiro</Eyebrow>
            {porDestino.length > 0 ? (
              <Farol
                itens={porDestino.slice(0, 5).map((d) => ({
                  tom: "g" as const,
                  titulo: d.nome,
                  texto: `${d.itens} emendas · ${brlCompacto(d.valor)}`,
                }))}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                As emendas do exercício ainda não foram apresentadas — os
                destinos aparecem aqui assim que forem registradas.
              </p>
            )}
            <CardSrc>
              {c.qtd} emendas apresentadas pelos vereadores · agregado por órgão
            </CardSrc>
          </Card360>

          <Card360>
            <Eyebrow>Como funciona a emenda impositiva</Eyebrow>
            <Farol
              itens={[
                {
                  tom: "g",
                  titulo: "O vereador indica",
                  texto:
                    "cada um destina sua cota a áreas e órgãos do município",
                },
                {
                  tom: "g",
                  titulo: "A Câmara confere e aprova",
                  texto:
                    "a comissão analisa e o Plenário vota junto com o orçamento",
                },
                {
                  tom: "a",
                  titulo: "A Prefeitura é obrigada a executar",
                  texto:
                    "por isso “impositiva” — a execução acompanha o exercício",
                },
              ]}
            />
            <CardSrc>
              a decisão é dos vereadores; a tecnologia só organiza e mostra
            </CardSrc>
          </Card360>
        </div>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-3 px-5 py-5 text-xs text-muted-foreground">
          <span>
            <b className="text-primary">Emendas360</b> — transparência das
            emendas parlamentares
          </span>
          <span>Valores agregados do exercício ativo · sem dados pessoais.</span>
        </div>
      </footer>
    </div>
  );
}
