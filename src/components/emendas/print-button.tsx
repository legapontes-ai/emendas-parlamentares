"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// Imprime a página atual (o navegador oferece "Salvar como PDF").
export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
      <Printer className="size-4" aria-hidden />
      Imprimir / PDF
    </Button>
  );
}
