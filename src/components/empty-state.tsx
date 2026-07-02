import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Estado vazio elegante e reutilizável (carregamento/erro/vazio consistentes).
export function EmptyState({
  icon: Icon,
  titulo,
  descricao,
  acao,
  className,
}: {
  icon?: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="mb-3 rounded-full bg-muted p-3">
          <Icon className="size-6 text-muted-foreground" aria-hidden />
        </div>
      ) : null}
      <h3 className="text-sm font-medium">{titulo}</h3>
      {descricao ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descricao}</p>
      ) : null}
      {acao ? <div className="mt-4">{acao}</div> : null}
    </div>
  );
}
