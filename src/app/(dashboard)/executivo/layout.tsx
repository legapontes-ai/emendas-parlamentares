import type { ReactNode } from "react";
import { Poder } from "@/generated/prisma/enums";
import { requirePoderAcesso } from "@/lib/access";

// Guard: só o Poder Executivo (ou SUPER_ADMIN) acessa este segmento.
export default async function ExecutivoLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePoderAcesso(Poder.EXECUTIVO);
  return <>{children}</>;
}
