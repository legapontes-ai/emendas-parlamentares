import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Todas as emendas"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Emendas", href: "/legislativo/emendas" }, { titulo: "Todas as emendas" }]}
      />
      <EmProducao titulo="Todas as emendas" prompt="PROMPT 7" />
    </div>
  );
}
