import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function Page() {
  return (
    <div>
      <PageHeader
        titulo="Execução"
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Acompanhamento", href: "/executivo/acompanhamento" }, { titulo: "Execução" }]}
      />
      <EmProducao titulo="Execução" prompt="PROMPT 8" />
    </div>
  );
}
