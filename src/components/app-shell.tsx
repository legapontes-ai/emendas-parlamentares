import type { ReactNode } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { Poder, Role } from "@/generated/prisma/enums";
import { vistasVisiveis } from "@/config/vistas360";
import { NavTabs360 } from "./nav-tabs-360";
import { ExercicioSelector } from "./exercicio-selector";
import { PerfilSwitcher } from "./perfil-switcher";
import { LogoEmendas360 } from "./logo-emendas360";

type ExercicioOpcao = { id: string; ano: number; status: string };

// Casca no padrão do mockup "Emendas 360": topbar escura (marca, exercício,
// visão pública, perfil) + abas horizontais por papel. Sem sidebar.
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
  const vistas = vistasVisiveis(user.role).map(({ id, titulo, href }) => ({
    id,
    titulo,
    href,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="grad-dark sticky top-0 z-40 text-white shadow-[0_2px_14px_rgba(6,24,64,.35)]">
        <div className="mx-auto flex h-14 max-w-[1320px] flex-wrap items-center gap-3 px-5">
          <Link href="/painel" className="shrink-0">
            <LogoEmendas360 />
          </Link>
          <div className="hidden border-l border-white/25 pl-4 text-sm font-bold leading-tight md:block">
            Emendas parlamentares
            <small className="block text-[10px] font-medium uppercase tracking-[1.4px] text-[#8fe8ff]">
              {anoAtivo ? `Exercício ${anoAtivo}` : "sem exercício ativo"}
            </small>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ExercicioSelector exercicios={exercicios} anoAtivo={anoAtivo} />
            <Link
              href="/publica"
              title="O que o cidadão vê"
              className="flex h-9 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-[#d6e2f7] hover:bg-white/20"
            >
              <Eye className="size-4" aria-hidden />
              <span className="hidden sm:inline">Visão pública</span>
            </Link>
            <PerfilSwitcher
              nome={user.nome}
              role={user.role}
              poder={user.poder}
            />
          </div>
        </div>
      </header>

      <NavTabs360 vistas={vistas} />

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-5 pb-16 pt-6">
        {children}
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-3 px-5 py-5 text-xs text-muted-foreground">
          <span>
            <b className="text-primary">Emendas360</b> — gestão de emendas
            parlamentares · orçamento impositivo
          </span>
          <span>
            A plataforma confere requisitos formais e organiza; a decisão de
            mérito e a assinatura são do parlamentar e da comissão.
          </span>
        </div>
      </footer>
    </div>
  );
}
