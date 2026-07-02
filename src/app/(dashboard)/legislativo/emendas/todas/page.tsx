import { PageHeader } from "@/components/page-header";
import { EmendasTable } from "@/components/emendas/emendas-table";
import { getAnoAtivo } from "@/lib/exercicio";
import { listarEmendas } from "@/lib/queries-orcamento";

export default async function TodasEmendasPage() {
  const ano = await getAnoAtivo();
  const emendas = await listarEmendas({ exercicioAno: ano });

  return (
    <div>
      <PageHeader
        titulo="Todas as emendas"
        descricao={`Emendas do exercício${ano ? ` ${ano}` : ""}.`}
        crumbs={[
          { titulo: "Hub", href: "/hub" },
          { titulo: "Emendas", href: "/legislativo/emendas" },
          { titulo: "Todas as emendas" },
        ]}
      />
      <EmendasTable emendas={emendas} />
    </div>
  );
}
