import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Relatórios"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Tramitação & Acompanhamento", href: "/legislativo/tramitacao" }, { titulo: "Relatórios" }]}
      />
      <EmProducao titulo="Relatórios" prompt="PROMPT 10" />
    </div>
  );
}
