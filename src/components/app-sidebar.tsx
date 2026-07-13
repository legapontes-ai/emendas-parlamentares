"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import type { Poder, Role } from "@/generated/prisma/enums";
import {
  modulosVisiveis,
  moduloPorPathname,
  podeVerFerramenta,
  type UsuarioNav,
} from "@/config/navegacao";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
}: {
  user: { poder: Poder | null; role: Role };
}) {
  const pathname = usePathname();
  const nav: UsuarioNav = { poder: user.poder, role: user.role };
  const modulos = modulosVisiveis(nav);
  const moduloAtual = moduloPorPathname(pathname);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/hub">
                {/* Marca Emendas360: três barras cyan→mint sobre navy */}
                <svg
                  viewBox="0 0 48 48"
                  className="size-8 shrink-0"
                  aria-hidden
                >
                  <rect width="48" height="48" rx="12" fill="rgba(255,255,255,.08)" />
                  <rect x="9.5" y="27" width="8" height="12" rx="2.2" fill="#00B4D8" />
                  <rect x="20" y="19.5" width="8" height="19.5" rx="2.2" fill="#00CFC2" />
                  <rect x="30.5" y="10" width="8" height="29" rx="2.2" fill="#00E5A0" />
                </svg>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-base font-extrabold tracking-tight">
                    <span className="text-brand-cyan">Emendas</span>
                    <span className="text-brand-mint">360</span>
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-[2px] text-[#9FB4D8]">
                    Orçamento impositivo
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarMenu>
            {modulos.map((m) => {
              const Icon = m.icon;
              const ativo = moduloAtual?.id === m.id;
              const ferramentas = m.ferramentas.filter((f) =>
                podeVerFerramenta(nav, m, f)
              );
              return (
                <SidebarMenuItem key={m.id}>
                  <SidebarMenuButton asChild isActive={ativo} tooltip={m.titulo}>
                    <Link href={m.href}>
                      <Icon aria-hidden />
                      <span>{m.titulo}</span>
                    </Link>
                  </SidebarMenuButton>

                  {ativo && ferramentas.length > 0 ? (
                    <SidebarMenuSub>
                      {ferramentas.map((f) => {
                        const FIcon = f.icon;
                        return (
                          <SidebarMenuSubItem key={f.id}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === f.href}
                            >
                              <Link href={f.href}>
                                <FIcon aria-hidden />
                                <span>{f.titulo}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Voltar ao hub">
              <Link href="/hub">
                <LayoutGrid aria-hidden />
                <span>Hub</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
