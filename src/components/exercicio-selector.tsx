"use client";

import { useTransition } from "react";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setExercicioAtivo } from "@/lib/actions/contexto";

type ExercicioOpcao = { id: string; ano: number; status: string };

// Seletor de Exercício global: troca o contexto de dados de toda a aplicação.
export function ExercicioSelector({
  exercicios,
  anoAtivo,
}: {
  exercicios: ExercicioOpcao[];
  anoAtivo: number | null;
}) {
  const [pending, start] = useTransition();

  if (exercicios.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/70">
        <CalendarDays className="size-4" aria-hidden />
        Nenhum exercício
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="size-4 text-white/70" aria-hidden />
      <Select
        value={anoAtivo ? String(anoAtivo) : undefined}
        onValueChange={(v) => start(() => setExercicioAtivo(Number(v)))}
      >
        {/* Estilo claro-sobre-escuro: este seletor vive na topbar navy */}
        <SelectTrigger
          size="sm"
          className="w-[140px] border-white/20 bg-white/10 text-white hover:bg-white/20 data-placeholder:text-white/70 [&_svg:not([class*='text-'])]:text-white/70"
          aria-label="Exercício ativo"
          disabled={pending}
        >
          <SelectValue placeholder="Exercício" />
        </SelectTrigger>
        <SelectContent>
          {exercicios.map((e) => (
            <SelectItem key={e.id} value={String(e.ano)}>
              {e.ano}
              {e.status !== "ABERTO" ? " · encerrado" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
