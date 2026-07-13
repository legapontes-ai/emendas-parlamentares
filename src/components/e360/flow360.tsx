import Link from "next/link";
import { cn } from "@/lib/utils";

export type EstadoEtapa = "done" | "now" | "next";

export type EtapaFluxo = {
  titulo: string;
  subtitulo: string;
  estado: EstadoEtapa;
  href?: string;
};

const ESTADO: Record<EstadoEtapa, string> = {
  done: "grad-main",
  now: "bg-primary ring-2 ring-brand-mint",
  next: "bg-[#8ca0c4]",
};

function Node({ etapa }: { etapa: EtapaFluxo }) {
  const classes = cn(
    "w-full max-w-[520px] rounded-xl px-4.5 py-3.5 text-center text-white shadow-[0_2px_10px_rgba(6,24,64,.07)] transition-transform",
    ESTADO[etapa.estado],
    etapa.href && "hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(6,24,64,.15)]"
  );
  const conteudo = (
    <>
      <span className="block text-sm font-bold">{etapa.titulo}</span>
      <small className="block text-[11.5px] font-semibold opacity-85">
        {etapa.subtitulo}
      </small>
    </>
  );
  if (etapa.href) {
    return (
      <Link href={etapa.href} className={classes}>
        {conteudo}
      </Link>
    );
  }
  return <div className={classes}>{conteudo}</div>;
}

function Seta() {
  return (
    <span
      className="my-1.5 h-0 w-0 border-x-[9px] border-t-[12px] border-x-transparent border-t-[#37589c]"
      aria-hidden
    />
  );
}

// Fluxograma vertical da tramitação (mockup): nós encadeados por setas, com o
// losango de decisão da conferência e o ramo de devolução para saneamento.
export function Flow360({
  antes,
  depois,
  decisao,
}: {
  antes: EtapaFluxo[];
  depois: EtapaFluxo[];
  decisao: { titulo: string; devolucao: string; devolucaoHref?: string };
}) {
  return (
    <div className="flex flex-col items-center">
      {antes.map((e, i) => (
        <div key={e.titulo} className="contents">
          {i > 0 ? <Seta /> : null}
          <Node etapa={e} />
        </div>
      ))}
      <Seta />
      <div
        className="my-1 flex w-[210px] items-center justify-center px-2.5 py-6 text-center text-sm font-extrabold text-white [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)] bg-[#2a3346]"
      >
        {decisao.titulo}
      </div>
      <div className="my-1.5 flex w-full max-w-[760px] flex-wrap items-center justify-center gap-4">
        {decisao.devolucaoHref ? (
          <Link
            href={decisao.devolucaoHref}
            className="rounded-xl bg-[#c0392b] px-4 py-3 text-center text-[13px] font-bold text-white shadow-[0_2px_10px_rgba(6,24,64,.07)] hover:brightness-110"
          >
            ◀ {decisao.devolucao}
          </Link>
        ) : (
          <span className="rounded-xl bg-[#c0392b] px-4 py-3 text-center text-[13px] font-bold text-white shadow-[0_2px_10px_rgba(6,24,64,.07)]">
            ◀ {decisao.devolucao}
          </span>
        )}
        <span className="rounded-xl bg-[#8a97ad] px-4 py-3 text-center text-[13px] font-bold text-white">
          Não → volta à conferência
        </span>
      </div>
      <Seta />
      {depois.map((e, i) => (
        <div key={e.titulo} className="contents">
          {i > 0 ? <Seta /> : null}
          <Node etapa={e} />
        </div>
      ))}
    </div>
  );
}
