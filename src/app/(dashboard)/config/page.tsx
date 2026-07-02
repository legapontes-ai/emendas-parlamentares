import { PageHeader } from "@/components/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { listarExercicios } from "@/lib/exercicio";
import {
  listarInstrumentos,
  listarNormas,
  listarNormasAtivas,
  listarParametros,
  listarProjetosDeLei,
  listarUsuarios,
} from "@/lib/queries";
import { ParametrosTab } from "@/components/config/parametros-tab";
import { NormasTab } from "@/components/config/normas-tab";
import { InstrumentosTab } from "@/components/config/instrumentos-tab";
import { UsuariosTab } from "@/components/config/usuarios-tab";

export default async function ConfigPage() {
  const [
    parametros,
    normas,
    normasAtivas,
    instrumentos,
    projetosDeLei,
    usuarios,
    exercicios,
  ] = await Promise.all([
    listarParametros(),
    listarNormas(),
    listarNormasAtivas(),
    listarInstrumentos(),
    listarProjetosDeLei(),
    listarUsuarios(),
    listarExercicios(),
  ]);

  const exOpc = exercicios.map((e) => ({ id: e.id, ano: e.ano }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        titulo="Configurações"
        descricao="Parâmetros de validação, repositório normativo, instrumentos e usuários."
        crumbs={[{ titulo: "Hub", href: "/hub" }, { titulo: "Configurações" }]}
      />

      <Tabs defaultValue="parametros">
        <TabsList>
          <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
          <TabsTrigger value="normas">Normas</TabsTrigger>
          <TabsTrigger value="instrumentos">Instrumentos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="parametros" className="mt-4">
          <ParametrosTab
            parametros={parametros}
            exercicios={exOpc}
            normasAtivas={normasAtivas}
          />
        </TabsContent>
        <TabsContent value="normas" className="mt-4">
          <NormasTab normas={normas} />
        </TabsContent>
        <TabsContent value="instrumentos" className="mt-4">
          <InstrumentosTab
            instrumentos={instrumentos}
            exercicios={exOpc}
            projetosDeLei={projetosDeLei}
          />
        </TabsContent>
        <TabsContent value="usuarios" className="mt-4">
          <UsuariosTab usuarios={usuarios} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
