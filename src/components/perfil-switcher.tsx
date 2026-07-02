"use client";

import { useTransition } from "react";
import { Check, ChevronsUpDown, LogOut, UserCog } from "lucide-react";
import { Role, type Poder } from "@/generated/prisma/enums";
import { sair } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setDevSession } from "@/lib/actions/contexto";

const ROTULOS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  EXEC_ADMIN: "Executivo · Admin",
  EXEC_PLANEJAMENTO: "Executivo · Planejamento",
  EXEC_CONSULTA: "Executivo · Consulta",
  LEG_ADMIN: "Legislativo · Mesa",
  LEG_TECNICO: "Legislativo · Técnico",
  LEG_AUTOR: "Legislativo · Vereador(a)",
  LEG_CONSULTA: "Legislativo · Consulta",
};

const ORDEM: Role[] = [
  Role.SUPER_ADMIN,
  Role.EXEC_ADMIN,
  Role.EXEC_PLANEJAMENTO,
  Role.EXEC_CONSULTA,
  Role.LEG_ADMIN,
  Role.LEG_TECNICO,
  Role.LEG_AUTOR,
  Role.LEG_CONSULTA,
];

// TEMPORÁRIO (PROMPT 2): indicador de perfil ativo + troca de papel para
// desenvolvimento. No PROMPT 9 vira o menu real de conta (Auth.js).
export function PerfilSwitcher({
  nome,
  role,
  poder,
}: {
  nome: string;
  role: Role;
  poder: Poder | null;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="hidden gap-1 sm:inline-flex">
        {poder ?? "Transversal"}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" disabled={pending}>
            <UserCog className="size-4" aria-hidden />
            <span className="hidden max-w-[180px] truncate sm:inline">
              {nome}
            </span>
            <ChevronsUpDown className="size-4 opacity-60" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            Perfil (dev)
            <Badge variant="secondary">{ROTULOS[role]}</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ORDEM.map((r) => (
            <DropdownMenuItem
              key={r}
              onSelect={() => start(() => setDevSession(r))}
              className="justify-between"
            >
              {ROTULOS[r]}
              {r === role ? <Check className="size-4" aria-hidden /> : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => start(() => sair())}>
            <LogOut className="size-4" aria-hidden />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
