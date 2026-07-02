import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ROTULO_STATUS_EMENDA, ROTULO_TIPO_EMENDA } from "@/lib/rotulos";

export type EmendaLinha = {
  id: string;
  numero: string;
  tipo: string;
  status: string;
  valor: number;
  autor: string;
  programa: string;
  acao: string;
};

function variante(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "APROVADA" || status === "VALIDA") return "default";
  if (status === "REJEITADA" || status === "INVALIDA") return "destructive";
  if (status === "RASCUNHO") return "outline";
  return "secondary";
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function EmendasTable({
  emendas,
  mostrarAutor = true,
}: {
  emendas: EmendaLinha[];
  mostrarAutor?: boolean;
}) {
  if (emendas.length === 0) {
    return (
      <EmptyState
        titulo="Nenhuma emenda"
        descricao="Não há emendas para o filtro atual."
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Nº</TableHead>
            {mostrarAutor ? <TableHead>Autor</TableHead> : null}
            <TableHead>Programa</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emendas.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">
                <Link href={`/legislativo/emendas/${e.id}`} className="hover:underline">
                  {e.numero}
                </Link>
              </TableCell>
              {mostrarAutor ? <TableCell>{e.autor}</TableCell> : null}
              <TableCell className="max-w-56 truncate" title={e.programa}>{e.programa}</TableCell>
              <TableCell className="max-w-56 truncate" title={e.acao}>{e.acao}</TableCell>
              <TableCell className="text-right tabular-nums">{brl(e.valor)}</TableCell>
              <TableCell>{ROTULO_TIPO_EMENDA[e.tipo] ?? e.tipo}</TableCell>
              <TableCell>
                <Badge variant={variante(e.status)}>
                  {ROTULO_STATUS_EMENDA[e.status] ?? e.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
