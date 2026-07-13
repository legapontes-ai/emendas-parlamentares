import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Card base do padrão do mockup (borda suave, raio 14px, sombra leve).
// Variantes: mesa (âmbar, pendência), dark/hi (gradientes).
export function Card360({
  children,
  variante = "padrao",
  className,
}: {
  children: ReactNode;
  variante?: "padrao" | "mesa" | "dark" | "hi";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl p-5 shadow-[0_2px_10px_rgba(6,24,64,.07)] ring-1",
        variante === "padrao" && "bg-card ring-foreground/10",
        variante === "mesa" &&
          "border-l-4 border-l-brand-amber bg-brand-amber/5 ring-brand-amber/25",
        variante === "dark" && "grad-dark text-white ring-transparent",
        variante === "hi" && "grad-main text-white ring-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}

// Rodapé de fonte do card (mockup .card-src): de onde vem o número.
export function CardSrc({
  children,
  direita,
  escuro,
}: {
  children: ReactNode;
  direita?: ReactNode;
  escuro?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-wrap justify-between gap-2 pt-3 text-[11.5px]",
        escuro ? "text-white/55" : "text-muted-foreground/80"
      )}
    >
      <span>{children}</span>
      {direita ? <span>{direita}</span> : null}
    </div>
  );
}

// Rótulo-antena de card (mockup .eyebrow) com suporte a fundo escuro.
export function Eyebrow({
  children,
  escuro,
  className,
}: {
  children: ReactNode;
  escuro?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("eyebrow mb-2", escuro && "text-brand-mint/90", className)}>
      {children}
    </div>
  );
}
