import { PageHeader } from "@/components/page-header";
import { EmProducao } from "@/components/em-producao";

export default function ConfigPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        titulo="Configurações"
        descricao="Parâmetros, repositório normativo, instrumentos e usuários."
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Configurações" }]}
      />
      <EmProducao titulo="Configurações" prompt="PROMPT 3" />
    </div>
  );
}
