import { Construction } from "lucide-react";
import { EmptyState } from "./empty-state";

// Placeholder honesto para áreas cuja implementação vem em um PROMPT seguinte.
export function EmProducao({
  titulo,
  prompt,
}: {
  titulo: string;
  prompt?: string;
}) {
  return (
    <EmptyState
      icon={Construction}
      titulo={`${titulo} — em construção`}
      descricao={
        prompt
          ? `Esta área será implementada no ${prompt}.`
          : "Esta área será implementada em uma etapa seguinte do projeto."
      }
    />
  );
}
