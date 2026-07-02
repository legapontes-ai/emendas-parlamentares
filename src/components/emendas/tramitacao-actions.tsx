"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aprovarEmenda, rejeitarEmenda } from "@/lib/actions/emendas";

// Aprovar/rejeitar uma emenda submetida, exigindo parecer.
export function TramitacaoActions({ id }: { id: string }) {
  const [pending, start] = useTransition();

  function decidir(
    fn: (id: string, parecer: unknown) => Promise<{ ok: boolean; error?: string }>,
    rotulo: string
  ) {
    const parecer = window.prompt(`Parecer para ${rotulo} a emenda:`);
    if (!parecer) return;
    start(async () => {
      const r = await fn(id, { parecer });
      if (r.ok) toast.success(`Emenda ${rotulo === "aprovar" ? "aprovada" : "rejeitada"}.`);
      else toast.error(r.error ?? "Falha.");
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => decidir(aprovarEmenda, "aprovar")}
      >
        <Check className="size-4" aria-hidden />
        Aprovar
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => decidir(rejeitarEmenda, "rejeitar")}
      >
        <X className="size-4" aria-hidden />
        Rejeitar
      </Button>
    </div>
  );
}
