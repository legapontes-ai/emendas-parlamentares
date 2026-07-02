"use client";

import type { ReactNode } from "react";
import type { Poder, Role } from "@/generated/prisma/enums";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./app-sidebar";
import { ExercicioSelector } from "./exercicio-selector";
import { PerfilSwitcher } from "./perfil-switcher";

type ExercicioOpcao = { id: string; ano: number; status: string };

// Casca da aplicação: sidebar (macro-módulos por Poder/role) + cabeçalho com
// seletor de Exercício e indicador/troca de perfil.
export function AppShell({
  user,
  exercicios,
  anoAtivo,
  children,
}: {
  user: { nome: string; poder: Poder | null; role: Role };
  exercicios: ExercicioOpcao[];
  anoAtivo: number | null;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={{ poder: user.poder, role: user.role }} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ExercicioSelector exercicios={exercicios} anoAtivo={anoAtivo} />
          <div className="ml-auto">
            <PerfilSwitcher
              nome={user.nome}
              role={user.role}
              poder={user.poder}
            />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
