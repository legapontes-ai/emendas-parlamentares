import Link from "next/link";
import { cn } from "@/lib/utils";

export type Subtab = { id: string; titulo: string };

// Pílulas de sub-navegação do mockup (.stab). Server-side: cada pílula é um
// link com ?aba=<id>, mantendo as vistas renderizadas no servidor.
export function Subtabs({
  base,
  abas,
  ativa,
}: {
  base: string;
  abas: Subtab[];
  ativa: string;
}) {
  return (
    <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
      {abas.map((a) => (
        <Link
          key={a.id}
          href={a.id === abas[0].id ? base : `${base}?aba=${a.id}`}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-4 py-1.5 text-xs font-semibold transition-colors",
            a.id === ativa
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-brand-cyan hover:text-foreground"
          )}
        >
          {a.titulo}
        </Link>
      ))}
    </div>
  );
}
