import "server-only";
import { cookies } from "next/headers";
import { Poder, Role } from "@/generated/prisma/enums";

// ============================================================================
// SESSÃO TEMPORÁRIA (PROMPT 2) — substituída pelo Auth.js real no PROMPT 9.
// Baseada em cookies de desenvolvimento para permitir demonstrar a filtragem
// por Poder/role (hub e sidebar). NÃO é autenticação de verdade.
// ============================================================================

export type SessionUser = {
  id: string;
  nome: string;
  email: string;
  poder: Poder | null;
  role: Role;
};

export const DEV_COOKIE_ROLE = "dev-role";
export const DEV_COOKIE_PODER = "dev-poder";

// Deriva o Poder padrão a partir do papel (SUPER_ADMIN é transversal → null).
export function poderPadraoDoRole(role: Role): Poder | null {
  if (role === Role.SUPER_ADMIN) return null;
  if (role.startsWith("EXEC_")) return Poder.EXECUTIVO;
  if (role.startsWith("LEG_")) return Poder.LEGISLATIVO;
  return null;
}

function nomePorRole(role: Role): string {
  const mapa: Record<Role, string> = {
    SUPER_ADMIN: "Administrador do Sistema",
    EXEC_ADMIN: "Administrador (Executivo)",
    EXEC_PLANEJAMENTO: "Planejamento (Executivo)",
    EXEC_CONSULTA: "Consulta (Executivo)",
    LEG_ADMIN: "Mesa Diretora (Legislativo)",
    LEG_TECNICO: "Analista (Legislativo)",
    LEG_AUTOR: "Vereador(a)",
    LEG_CONSULTA: "Consulta (Legislativo)",
  };
  return mapa[role];
}

function ehRole(valor: string | undefined): valor is Role {
  return !!valor && Object.prototype.hasOwnProperty.call(Role, valor);
}

export async function getCurrentUser(): Promise<SessionUser> {
  const jar = await cookies();
  const roleCookie = jar.get(DEV_COOKIE_ROLE)?.value;
  const role: Role = ehRole(roleCookie) ? roleCookie : Role.SUPER_ADMIN;

  const poderCookie = jar.get(DEV_COOKIE_PODER)?.value;
  const poder: Poder | null =
    poderCookie === Poder.LEGISLATIVO || poderCookie === Poder.EXECUTIVO
      ? (poderCookie as Poder)
      : poderPadraoDoRole(role);

  return {
    id: "dev-user",
    nome: nomePorRole(role),
    email: "dev@local",
    poder,
    role,
  };
}
