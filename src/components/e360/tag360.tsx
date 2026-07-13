import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONS = {
  ok: "bg-brand-mint/15 text-brand-green",
  warn: "bg-brand-amber/15 text-[#b97a0b]",
  bad: "bg-destructive/10 text-destructive",
  info: "bg-accent text-accent-foreground",
  roxo: "bg-brand-purple/12 text-brand-purple",
  pend: "bg-secondary text-muted-foreground",
} as const;

export type TomTag = keyof typeof TONS;

// Tag/pílula de status do mockup (ok/warn/bad/info/roxo/pend).
export function Tag360({
  tom,
  children,
  className,
}: {
  tom: TomTag;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        TONS[tom],
        className
      )}
    >
      {children}
    </span>
  );
}

// Mapeia o StatusEmenda do domínio para o tom visual do mockup.
export function tomDoStatus(status: string): TomTag {
  switch (status) {
    case "APROVADA":
      return "ok";
    case "VALIDA":
      return "info";
    case "SUBMETIDA":
    case "EM_TRAMITACAO":
      return "roxo";
    case "INVALIDA":
    case "REJEITADA":
      return "bad";
    case "EM_VALIDACAO":
      return "warn";
    default:
      return "pend";
  }
}
