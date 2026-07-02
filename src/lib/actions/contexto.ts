"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Poder, Role } from "@/generated/prisma/enums";
import {
  COOKIE_EXERCICIO,
} from "@/lib/exercicio";
import {
  DEV_COOKIE_PODER,
  DEV_COOKIE_ROLE,
  poderPadraoDoRole,
} from "@/lib/session";

const UM_ANO = 60 * 60 * 24 * 365;

// Define o Exercício ativo (cookie), refletindo em toda a UI.
export async function setExercicioAtivo(ano: number): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_EXERCICIO, String(ano), { path: "/", maxAge: UM_ANO });
  revalidatePath("/", "layout");
}

// TEMPORÁRIO (PROMPT 2): troca o perfil de desenvolvimento (papel + Poder).
// Substituído pela sessão real do Auth.js no PROMPT 9.
export async function setDevSession(role: Role): Promise<void> {
  const jar = await cookies();
  const poder = poderPadraoDoRole(role);
  jar.set(DEV_COOKIE_ROLE, role, { path: "/", maxAge: UM_ANO });
  if (poder === Poder.LEGISLATIVO || poder === Poder.EXECUTIVO) {
    jar.set(DEV_COOKIE_PODER, poder, { path: "/", maxAge: UM_ANO });
  } else {
    jar.delete(DEV_COOKIE_PODER);
  }
  revalidatePath("/", "layout");
}
