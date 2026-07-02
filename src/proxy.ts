import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Proxy (novo nome do middleware no Next 16): edge-safe, protege as rotas em
// produção. Em desenvolvimento o callback `authorized` libera o acesso.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
