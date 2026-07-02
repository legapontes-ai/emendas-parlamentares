import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="PL × Lei aprovada"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Acompanhamento", href: "/executivo/acompanhamento" }, { titulo: "PL × Lei aprovada" }]}
      />
      <EmProducao titulo="PL × Lei aprovada" prompt="PROMPT 8" />
    </div>
  );
}
