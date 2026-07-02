import { redirect } from "next/navigation";

// Sem autenticação real ainda (PROMPT 9): a raiz leva ao hub.
export default function Home() {
  redirect("/hub");
}
