"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type VistaTab = { id: string; titulo: string; href: string };

// Rotas das ferramentas legadas agrupadas sob a aba "Ferramentas".
const PREFIXOS_FERRAMENTAS = ["/hub", "/legislativo", "/executivo", "/config"];

function tabAtiva(pathname: string, tab: VistaTab): boolean {
  if (tab.href === "/hub") {
    return PREFIXOS_FERRAMENTAS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
  }
  return pathname === tab.href || pathname.startsWith(tab.href + "/");
}

// Abas horizontais do mockup (.nav-tabs): grudadas sob a topbar, com a aba
// ativa sublinhada pelo gradiente cyan→mint.
export function NavTabs360({ vistas }: { vistas: VistaTab[] }) {
  const pathname = usePathname();
  return (
    <nav className="sticky top-14 z-30 border-b bg-card">
      <div className="mx-auto flex max-w-[1320px] gap-0.5 overflow-x-auto px-5">
        {vistas.map((v) => {
          const ativa = tabAtiva(pathname, v);
          return (
            <Link
              key={v.id}
              href={v.href}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-[3px] px-3.5 pb-2.5 pt-3 text-sm font-semibold transition-colors",
                ativa
                  ? "border-brand-cyan text-primary [border-image:linear-gradient(90deg,#00b4d8,#00e5a0)_1]"
                  : "border-transparent text-muted-foreground hover:text-primary"
              )}
            >
              {v.titulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
