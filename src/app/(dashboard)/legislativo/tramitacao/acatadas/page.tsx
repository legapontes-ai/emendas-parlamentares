import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Acatadas na lei"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Tramitação & Acompanhamento", href: "/legislativo/tramitacao" }, { titulo: "Acatadas na lei" }]}
      />
      <EmProducao titulo="Acatadas na lei" prompt="PROMPT 8" />
    </div>
  );
}
