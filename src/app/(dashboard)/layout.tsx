import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/session";
import { getAnoAtivo, listarExercicios } from "@/lib/exercicio";

// Layout da casca autenticada: monta a sidebar/cabeçalho e injeta o contexto
// (usuário, exercícios e ano ativo). Usa cookies → renderização dinâmica.
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const exercicios = await listarExercicios();
  const anoAtivo = await getAnoAtivo(exercicios);

  return (
    <AppShell
      user={{ nome: user.nome, poder: user.poder, role: user.role }}
      exercicios={exercicios}
      anoAtivo={anoAtivo}
    >
      {children}
    </AppShell>
  );
}
