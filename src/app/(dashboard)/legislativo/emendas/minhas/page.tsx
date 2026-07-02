import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Minhas emendas"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Emendas", href: "/legislativo/emendas" }, { titulo: "Minhas emendas" }]}
      />
      <EmProducao titulo="Minhas emendas" prompt="PROMPT 7" />
    </div>
  );
}
