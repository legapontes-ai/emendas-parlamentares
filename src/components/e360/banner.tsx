import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONS = {
  warn: "border-brand-amber/40 bg-brand-amber/10 text-[#8a5b06]",
  ok: "border-brand-green/30 bg-brand-mint/10 text-[#0b6e4c]",
  roxo: "border-brand-purple/30 bg-brand-purple/10 text-[#4a3a8c]",
  vermelho: "border-destructive/30 bg-destructive/5 text-[#a83236]",
} as const;

// Faixa de aviso do topo das vistas (mockup .banner): emoji + texto + tag,
// inteira clicável quando tem destino.
export function Banner({
  tom,
  emoji,
  children,
  tag,
  href,
  className,
}: {
  tom: keyof typeof TONS;
  emoji: string;
  children: ReactNode;
  tag?: ReactNode;
  href?: string;
  className?: string;
}) {
  const corpo = (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-[13.5px]",
        TONS[tom],
        href && "transition-shadow hover:shadow-[0_4px_14px_rgba(6,24,64,.08)]",
        className
      )}
    >
      <span aria-hidden>{emoji}</span>
      <span className="min-w-0 flex-1">{children}</span>
      {tag ? <span className="ml-auto">{tag}</span> : null}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {corpo}
      </Link>
    );
  }
  return corpo;
}
