import { getCurrentUser } from "@/lib/session";
import { modulosVisiveis } from "@/config/navegacao";
import { GradeCards } from "@/components/cards-navegacao";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

// Hub pós-login: cards grandes apenas dos macro-módulos do Poder/role do usuário.
export default async function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const user = await getCurrentUser();
  const modulos = modulosVisiveis({ poder: user.poder, role: user.role });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        titulo={`Olá, ${user.nome}`}
        descricao="Selecione um módulo para começar."
      />

      {erro === "acesso-negado" ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          Acesso negado: seu perfil não tem permissão para o módulo solicitado.
        </div>
      ) : null}

      {modulos.length > 0 ? (
        <GradeCards
          itens={modulos.map((m) => ({
            titulo: m.titulo,
            descricao: m.descricao,
            href: m.href,
            icon: m.icon,
          }))}
        />
      ) : (
        <EmptyState
          titulo="Nenhum módulo disponível"
          descricao="Seu perfil ainda não tem módulos atribuídos."
        />
      )}
    </div>
  );
}
