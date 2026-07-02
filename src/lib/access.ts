import "server-only";
import { redirect } from "next/navigation";
import { Poder, Role } from "@/generated/prisma/enums";
import { getCurrentUser, type SessionUser } from "./session";
import { moduloPorId, podeVerModulo } from "@/config/navegacao";

// ============================================================================
// Guards de rota no servidor. Acessar módulo/Poder não permitido → redirect ao
// hub (com marcador de erro). SUPER_ADMIN passa por tudo.
// ============================================================================

// Exige acesso a um macro-módulo específico (por id do mapa de navegação).
export async function requireModuloAcesso(
  moduloId: string
): Promise<SessionUser> {
  const user = await getCurrentUser();
  const modulo = moduloPorId(moduloId);
  if (!modulo || !podeVerModulo({ poder: user.poder, role: user.role }, modulo)) {
    redirect("/hub?erro=acesso-negado");
  }
  return user;
}

// Exige que o usuário pertença a um Poder (ou seja SUPER_ADMIN).
export async function requirePoderAcesso(poder: Poder): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user.role !== Role.SUPER_ADMIN && user.poder !== poder) {
    redirect("/hub?erro=acesso-negado");
  }
  return user;
}

// Exige que o usuário tenha um dos papéis informados (ou seja SUPER_ADMIN).
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user.role !== Role.SUPER_ADMIN && !roles.includes(user.role)) {
    redirect("/hub?erro=acesso-negado");
  }
  return user;
}
