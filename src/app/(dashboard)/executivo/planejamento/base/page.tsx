import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Base de dotações"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Planejamento & Orçamento", href: "/executivo/planejamento" }, { titulo: "Base de dotações" }]}
      />
      <EmProducao titulo="Base de dotações" prompt="PROMPT 4" />
    </div>
  );
}
