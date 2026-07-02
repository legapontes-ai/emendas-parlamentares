import * as XLSX from "xlsx";
import { getCurrentUser } from "@/lib/session";
import { listarEmendas } from "@/lib/queries-orcamento";
import { ROTULO_STATUS_EMENDA, ROTULO_TIPO_EMENDA } from "@/lib/rotulos";

// Exportação de emendas por exercício em CSV/XLSX (respeita o filtro de ano).
export async function GET(req: Request) {
  await getCurrentUser(); // garante contexto de sessão (dev/produção)

  const url = new URL(req.url);
  const ano = Number(url.searchParams.get("ano")) || null;
  const formato = url.searchParams.get("formato") === "xlsx" ? "xlsx" : "csv";

  const emendas = await listarEmendas({ exercicioAno: ano });
  const linhas = emendas.map((e) => ({
    Numero: e.numero,
    Autor: e.autor,
    Programa: e.programa,
    Acao: e.acao,
    Tipo: ROTULO_TIPO_EMENDA[e.tipo] ?? e.tipo,
    Status: ROTULO_STATUS_EMENDA[e.status] ?? e.status,
    Valor: e.valor,
  }));

  const ws = XLSX.utils.json_to_sheet(linhas);
  const nome = `emendas-${ano ?? "todos"}`;

  if (formato === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new Response("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nome}.csv"`,
      },
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Emendas");
  const buffer: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nome}.xlsx"`,
    },
  });
}
