import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Situação das emendas"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Tramitação & Acompanhamento", href: "/legislativo/tramitacao" }, { titulo: "Situação das emendas" }]}
      />
      <EmProducao titulo="Situação das emendas" prompt="PROMPT 8" />
    </div>
  );
}
