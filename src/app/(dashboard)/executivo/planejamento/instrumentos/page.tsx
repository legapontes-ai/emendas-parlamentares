import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Instrumentos"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Planejamento & Orçamento", href: "/executivo/planejamento" }, { titulo: "Instrumentos" }]}
      />
      <EmProducao titulo="Instrumentos" prompt="PROMPT 3" />
    </div>
  );
}
