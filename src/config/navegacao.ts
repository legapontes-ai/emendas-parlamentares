import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CircleCheck,
  Database,
  FileCheck2,
  FileEdit,
  FilePlus2,
  FileStack,
  FileText,
  GitBranch,
  GitCompareArrows,
  Landmark,
  LineChart,
  ListChecks,
  ScrollText,
  Settings,
  BarChart3,
} from "lucide-react";
import { Poder, Role } from "@/generated/prisma/enums";

// ============================================================================
// Mapa de navegação central. É a ÚNICA fonte de verdade da casca: hub e sidebar
// renderizam a partir daqui, filtrando pela sessão. "Mínimo aparente" é regra de
// dados — o usuário só vê o que seu Poder/role permite.
// ============================================================================

export type EscopoPoder = Poder | "TRANSVERSAL";

export type Ferramenta = {
  id: string;
  titulo: string;
  descricao?: string;
  href: string;
  icon: LucideIcon;
  // Se ausente, herda os papéis do macro-módulo.
  roles?: Role[];
};

export type MacroModulo = {
  id: string;
  titulo: string;
  descricao: string;
  href: string;
  icon: LucideIcon;
  poder: EscopoPoder;
  roles: Role[];
  ferramentas: Ferramenta[];
};

export type UsuarioNav = {
  poder: Poder | null;
  role: Role;
};

const LEG_TODOS: Role[] = [
  Role.LEG_ADMIN,
  Role.LEG_TECNICO,
  Role.LEG_AUTOR,
  Role.LEG_CONSULTA,
];
const EXEC_TODOS: Role[] = [
  Role.EXEC_ADMIN,
  Role.EXEC_PLANEJAMENTO,
  Role.EXEC_CONSULTA,
];

export const NAVEGACAO: MacroModulo[] = [
  // ---------------------------------------------------------------- LEGISLATIVO
  {
    id: "leg-emendas",
    titulo: "Emendas",
    descricao:
      "Apresentar, validar e submeter emendas sobre a base do projeto de lei.",
    href: "/legislativo/emendas",
    icon: FileEdit,
    poder: Poder.LEGISLATIVO,
    roles: LEG_TODOS,
    ferramentas: [
      {
        id: "leg-emendas-nova",
        titulo: "Nova emenda",
        descricao: "Apresentar uma emenda com seleção assistida da dotação.",
        href: "/legislativo/emendas/nova",
        icon: FilePlus2,
        roles: [Role.LEG_ADMIN, Role.LEG_TECNICO, Role.LEG_AUTOR],
      },
      {
        id: "leg-emendas-minhas",
        titulo: "Minhas emendas",
        descricao: "Emendas de sua autoria e seus status.",
        href: "/legislativo/emendas/minhas",
        icon: FileText,
        roles: [Role.LEG_ADMIN, Role.LEG_TECNICO, Role.LEG_AUTOR],
      },
      {
        id: "leg-emendas-todas",
        titulo: "Todas as emendas",
        descricao: "Todas as emendas do exercício, com filtros.",
        href: "/legislativo/emendas/todas",
        icon: FileStack,
        roles: [Role.LEG_ADMIN, Role.LEG_TECNICO, Role.LEG_CONSULTA],
      },
    ],
  },
  {
    id: "leg-tramitacao",
    titulo: "Tramitação & Acompanhamento",
    descricao:
      "Situação das emendas, emendas acatadas na lei aprovada e relatórios.",
    href: "/legislativo/tramitacao",
    icon: GitBranch,
    poder: Poder.LEGISLATIVO,
    roles: LEG_TODOS,
    ferramentas: [
      {
        id: "leg-tram-status",
        titulo: "Situação das emendas",
        href: "/legislativo/tramitacao/status",
        icon: ListChecks,
      },
      {
        id: "leg-tram-acatadas",
        titulo: "Acatadas na lei",
        href: "/legislativo/tramitacao/acatadas",
        icon: CircleCheck,
      },
      {
        id: "leg-tram-relatorios",
        titulo: "Relatórios",
        href: "/legislativo/tramitacao/relatorios",
        icon: BarChart3,
      },
    ],
  },
  // ------------------------------------------------------------------ EXECUTIVO
  {
    id: "exec-planejamento",
    titulo: "Planejamento & Orçamento",
    descricao:
      "Instrumentos PPA/LDO/LOA, base de dotações e leis aprovadas.",
    href: "/executivo/planejamento",
    icon: Landmark,
    poder: Poder.EXECUTIVO,
    roles: EXEC_TODOS,
    ferramentas: [
      {
        id: "exec-plan-instrumentos",
        titulo: "Instrumentos",
        descricao: "Projetos de lei e leis aprovadas do exercício.",
        href: "/executivo/planejamento/instrumentos",
        icon: ScrollText,
      },
      {
        id: "exec-plan-base",
        titulo: "Base de dotações",
        descricao: "Gerar e gerir a base estruturada a partir do PL.",
        href: "/executivo/planejamento/base",
        icon: Database,
        roles: [Role.EXEC_ADMIN, Role.EXEC_PLANEJAMENTO],
      },
      {
        id: "exec-plan-lei",
        titulo: "Lei aprovada",
        descricao: "Subir a lei aprovada e conduzir o ciclo de vida.",
        href: "/executivo/planejamento/lei-aprovada",
        icon: FileCheck2,
        roles: [Role.EXEC_ADMIN, Role.EXEC_PLANEJAMENTO],
      },
    ],
  },
  {
    id: "exec-acompanhamento",
    titulo: "Acompanhamento",
    descricao:
      "Comparação PL × lei aprovada, execução e emendas incorporadas.",
    href: "/executivo/acompanhamento",
    icon: LineChart,
    poder: Poder.EXECUTIVO,
    roles: EXEC_TODOS,
    ferramentas: [
      {
        id: "exec-acomp-comparacao",
        titulo: "PL × Lei aprovada",
        href: "/executivo/acompanhamento/comparacao",
        icon: GitCompareArrows,
      },
      {
        id: "exec-acomp-execucao",
        titulo: "Execução",
        href: "/executivo/acompanhamento/execucao",
        icon: Activity,
      },
    ],
  },
  // ----------------------------------------------------------------- TRANSVERSAL
  {
    id: "config",
    titulo: "Configurações",
    descricao:
      "Parâmetros de validação, normas (LOM/RI), instrumentos e usuários.",
    href: "/config",
    icon: Settings,
    poder: "TRANSVERSAL",
    roles: [Role.SUPER_ADMIN, Role.EXEC_ADMIN, Role.LEG_ADMIN],
    // Ferramentas de config são abas dentro de /config (PROMPT 3).
    ferramentas: [],
  },
];

// ---------------------------------------------------------------------------
// Regras de visibilidade (puras — usadas no servidor e no cliente).
// ---------------------------------------------------------------------------

export function podeVerModulo(u: UsuarioNav, m: MacroModulo): boolean {
  if (u.role === Role.SUPER_ADMIN) return true;
  const poderOk = m.poder === "TRANSVERSAL" || m.poder === u.poder;
  return poderOk && m.roles.includes(u.role);
}

export function podeVerFerramenta(
  u: UsuarioNav,
  m: MacroModulo,
  f: Ferramenta
): boolean {
  if (!podeVerModulo(u, m)) return false;
  if (u.role === Role.SUPER_ADMIN) return true;
  const roles = f.roles ?? m.roles;
  return roles.includes(u.role);
}

export function modulosVisiveis(u: UsuarioNav): MacroModulo[] {
  return NAVEGACAO.filter((m) => podeVerModulo(u, m));
}

export function moduloPorId(id: string): MacroModulo | undefined {
  return NAVEGACAO.find((m) => m.id === id);
}

// Encontra o macro-módulo cujo href casa com o caminho atual (para o 2º nível).
export function moduloPorPathname(pathname: string): MacroModulo | undefined {
  return NAVEGACAO.find(
    (m) => pathname === m.href || pathname.startsWith(m.href + "/")
  );
}
