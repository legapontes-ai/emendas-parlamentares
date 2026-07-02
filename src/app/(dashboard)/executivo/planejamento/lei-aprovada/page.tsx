import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Lei aprovada"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Planejamento & Orçamento", href: "/executivo/planejamento" }, { titulo: "Lei aprovada" }]}
      />
      <EmProducao titulo="Lei aprovada" prompt="PROMPT 8" />
    </div>
  );
}
