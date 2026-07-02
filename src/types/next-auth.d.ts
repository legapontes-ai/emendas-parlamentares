import type { DefaultSession } from "next-auth";
import type { Poder, Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      poder: Poder | null;
    } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
    poder?: Poder | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    poder?: Poder | null;
  }
}
