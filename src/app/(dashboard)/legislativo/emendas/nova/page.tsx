import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Nova emenda"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Emendas", href: "/legislativo/emendas" }, { titulo: "Nova emenda" }]}
      />
      <EmProducao titulo="Nova emenda" prompt="PROMPT 7" />
    </div>
  );
}
