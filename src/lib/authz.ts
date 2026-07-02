import { Poder, Role } from "@/generated/prisma/enums";

// Regras de autorização PURAS (sem I/O) — testáveis. As server actions carregam
// o ator/recurso e decidem com estas funções. SUPER_ADMIN passa por tudo.

export type Ator = {
  id: string;
  role: Role;
  poder: Poder | null;
};

export const ehSuper = (a: Ator) => a.role === Role.SUPER_ADMIN;

export const ehConsulta = (a: Ator) =>
  a.role === Role.EXEC_CONSULTA || a.role === Role.LEG_CONSULTA;

// Admin responsável por um Poder (para gerir configurações/usuários daquele Poder).
export function ehAdminDoPoder(a: Ator, poder: Poder): boolean {
  if (ehSuper(a)) return true;
  return poder === Poder.EXECUTIVO
    ? a.role === Role.EXEC_ADMIN
    : a.role === Role.LEG_ADMIN;
}

const CRIADORES = new Set<Role>([Role.LEG_ADMIN, Role.LEG_TECNICO, Role.LEG_AUTOR]);
const TRAMITADORES = new Set<Role>([Role.LEG_ADMIN, Role.LEG_TECNICO]);
const GESTORES_LEG = new Set<Role>([Role.LEG_ADMIN, Role.LEG_TECNICO]);

// Pode apresentar (criar) emendas.
export function podeCriarEmenda(a: Ator): boolean {
  return ehSuper(a) || CRIADORES.has(a.role);
}

// Pode aprovar/rejeitar emendas submetidas.
export function podeTramitar(a: Ator): boolean {
  return ehSuper(a) || TRAMITADORES.has(a.role);
}

// Pode editar/validar/submeter uma emenda:
//  - SUPER_ADMIN e Mesa/Técnico do Legislativo: qualquer emenda;
//  - LEG_AUTOR: apenas as próprias (autor vinculado ao seu usuário).
export function podeGerirEmenda(
  a: Ator,
  emenda: { autorUsuarioId: string | null }
): boolean {
  if (ehSuper(a) || GESTORES_LEG.has(a.role)) return true;
  if (a.role === Role.LEG_AUTOR) return emenda.autorUsuarioId === a.id;
  return false;
}

// Pode abrir/encerrar exercícios (ADMINs).
export function podeGerirExercicio(a: Ator): boolean {
  return ehSuper(a) || a.role === Role.EXEC_ADMIN || a.role === Role.LEG_ADMIN;
}
