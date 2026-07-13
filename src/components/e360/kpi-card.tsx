import Link from "next/link";
import { cn } from "@/lib/utils";

export type Delta = {
  tom: "up" | "down" | "neutral" | "warn";
  texto: string;
};

const TOM_DELTA: Record<Delta["tom"], string> = {
  up: "bg-brand-mint/15 text-brand-green",
  down: "bg-destructive/10 text-destructive",
  neutral: "bg-secondary text-muted-foreground",
  warn: "bg-brand-amber/15 text-[#b97a0b]",
};

// Card KPI do mockup: eyebrow + número forte + rótulo + delta.
// `variante` hi/dark usa os gradientes da identidade; `href` torna o card
// clicável com o rodapé "ver detalhe →".
export function KpiCard({
  eyebrow,
  numero,
  rotulo,
  delta,
  href,
  variante = "padrao",
  fonte,
  className,
}: {
  eyebrow: string;
  numero: string;
  rotulo: string;
  delta?: Delta;
  href?: string;
  variante?: "padrao" | "hi" | "dark";
  fonte?: string;
  className?: string;
}) {
  const escuro = variante !== "padrao";
  const corpo = (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl p-5 ring-1 transition-all duration-150",
        variante === "padrao" && "bg-card ring-foreground/10",
        variante === "hi" && "grad-main text-white ring-transparent",
        variante === "dark" && "grad-dark text-white ring-transparent",
        href &&
          "hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(6,24,64,.12)] hover:ring-brand-cyan",
        className
      )}
    >
      <div className={cn("eyebrow", escuro && "text-brand-mint/90")}>{eyebrow}</div>
      <div className="kpi-num mt-1" style={{ fontSize: 22 }}>
        {numero}
      </div>
      <div className={cn("kpi-lbl", escuro && "text-white/75")}>{rotulo}</div>
      {delta ? (
        <span
          className={cn(
            "mt-2 w-fit rounded-full px-2.5 py-0.5 text-xs font-bold",
            escuro ? "bg-white/15 text-white" : TOM_DELTA[delta.tom]
          )}
        >
          {delta.texto}
        </span>
      ) : null}
      {fonte ? (
        <div
          className={cn(
            "mt-auto pt-3 text-[11.5px]",
            escuro ? "text-white/55" : "text-muted-foreground/80"
          )}
        >
          {fonte}
        </div>
      ) : null}
      {href ? (
        <span
          className={cn(
            "mt-2 text-[11px] font-bold",
            escuro ? "text-brand-mint" : "text-brand-cyan"
          )}
        >
          ver detalhe →
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {corpo}
      </Link>
    );
  }
  return corpo;
}
