"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, LayoutGrid } from "lucide-react";
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Landmark className="size-4" aria-hidden />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Emendas</span>
                  <span className="text-xs text-muted-foreground">
                    Parlamentares
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
