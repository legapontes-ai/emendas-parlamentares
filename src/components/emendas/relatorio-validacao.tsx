import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ItemValidacao, ResultadoMotor } from "@/lib/validation/motor";

function Icone({ status }: { status: ItemValidacao["status"] }) {
  if (status === "OK") return <CheckCircle2 className="size-4 text-green-600" aria-hidden />;
  if (status === "ALERTA") return <AlertTriangle className="size-4 text-amber-500" aria-hidden />;
  return <XCircle className="size-4 text-destructive" aria-hidden />;
}

// Relatório item a item do motor de validação.
export function RelatorioValidacao({ relatorio }: { relatorio: ResultadoMotor }) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Resultado da validação:</span>
        <Badge variant={relatorio.resultado === "VALIDA" ? "default" : "destructive"}>
          {relatorio.resultado === "VALIDA" ? "Válida" : "Inválida"}
        </Badge>
      </div>
      <ul className="space-y-2">
        {relatorio.itens.map((it) => (
          <li key={it.codigo} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5">
              <Icone status={it.status} />
            </span>
            <div>
              <p className="font-medium">{it.descricao}</p>
              <p className="text-muted-foreground">{it.detalhe}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
