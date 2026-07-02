import type { ReactNode } from "react";
import { Role } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/access";

// Guard: Configurações é restrito a SUPER_ADMIN e aos ADMIN de cada Poder.
export default async function ConfigLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(Role.EXEC_ADMIN, Role.LEG_ADMIN);
  return <>{children}</>;
}
