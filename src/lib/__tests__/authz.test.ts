import { describe, expect, it } from "vitest";
import { Poder, Role } from "@/generated/prisma/enums";
import {
  ehAdminDoPoder,
  ehConsulta,
  podeCriarEmenda,
  podeGerirEmenda,
  podeTramitar,
  type Ator,
} from "../authz";

const ator = (role: Role, poder: Poder | null, id = "u1"): Ator => ({ id, role, poder });

describe("authz", () => {
  it("podeCriarEmenda: papéis do Legislativo e super, não o Executivo", () => {
    expect(podeCriarEmenda(ator(Role.LEG_AUTOR, Poder.LEGISLATIVO))).toBe(true);
    expect(podeCriarEmenda(ator(Role.LEG_TECNICO, Poder.LEGISLATIVO))).toBe(true);
    expect(podeCriarEmenda(ator(Role.SUPER_ADMIN, null))).toBe(true);
    expect(podeCriarEmenda(ator(Role.EXEC_PLANEJAMENTO, Poder.EXECUTIVO))).toBe(false);
    expect(podeCriarEmenda(ator(Role.LEG_CONSULTA, Poder.LEGISLATIVO))).toBe(false);
  });

  it("podeGerirEmenda: autor só nas próprias; mesa/técnico em qualquer", () => {
    const autor = ator(Role.LEG_AUTOR, Poder.LEGISLATIVO, "user-1");
    expect(podeGerirEmenda(autor, { autorUsuarioId: "user-1" })).toBe(true);
    expect(podeGerirEmenda(autor, { autorUsuarioId: "outro" })).toBe(false);

    const tecnico = ator(Role.LEG_TECNICO, Poder.LEGISLATIVO);
    expect(podeGerirEmenda(tecnico, { autorUsuarioId: "qualquer" })).toBe(true);
  });

  it("podeTramitar: técnico/mesa e super", () => {
    expect(podeTramitar(ator(Role.LEG_TECNICO, Poder.LEGISLATIVO))).toBe(true);
    expect(podeTramitar(ator(Role.LEG_AUTOR, Poder.LEGISLATIVO))).toBe(false);
  });

  it("ehAdminDoPoder respeita a separação de Poderes", () => {
    expect(ehAdminDoPoder(ator(Role.EXEC_ADMIN, Poder.EXECUTIVO), Poder.EXECUTIVO)).toBe(true);
    expect(ehAdminDoPoder(ator(Role.EXEC_ADMIN, Poder.EXECUTIVO), Poder.LEGISLATIVO)).toBe(false);
    expect(ehAdminDoPoder(ator(Role.LEG_ADMIN, Poder.LEGISLATIVO), Poder.LEGISLATIVO)).toBe(true);
    expect(ehAdminDoPoder(ator(Role.SUPER_ADMIN, null), Poder.EXECUTIVO)).toBe(true);
  });

  it("ehConsulta identifica papéis de leitura", () => {
    expect(ehConsulta(ator(Role.EXEC_CONSULTA, Poder.EXECUTIVO))).toBe(true);
    expect(ehConsulta(ator(Role.LEG_CONSULTA, Poder.LEGISLATIVO))).toBe(true);
    expect(ehConsulta(ator(Role.LEG_ADMIN, Poder.LEGISLATIVO))).toBe(false);
  });
});
