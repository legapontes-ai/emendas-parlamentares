import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ItemCard = {
  titulo: string;
  descricao?: string;
  href: string;
  icon: LucideIcon;
};

// Grade de cards grandes (hub e landing dos macro-módulos). Navegável por teclado.
export function GradeCards({ itens }: { itens: ItemCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {itens.map((it) => {
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <div className="mb-1 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{it.titulo}</CardTitle>
                </div>
                {it.descricao ? (
                  <CardDescription>{it.descricao}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-primary">
                  Abrir <ArrowRight className="size-4" aria-hidden />
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
