import type { ReactNode } from "react";
import { Poder } from "@/generated/prisma/enums";
import { requirePoderAcesso } from "@/lib/access";

// Guard: só o Poder Legislativo (ou SUPER_ADMIN) acessa este segmento.
export default async function LegislativoLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePoderAcesso(Poder.LEGISLATIVO);
  return <>{children}</>;
}
