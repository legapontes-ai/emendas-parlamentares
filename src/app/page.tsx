import { redirect } from "next/navigation";

// A raiz leva ao painel (o painel redireciona o gabinete p/ o Vereador 360).
export default function Home() {
  redirect("/painel");
}
