import { cn } from "@/lib/utils";

// Marca Emendas360: três barras cyan→mint + wordmark. Usada na topbar escura,
// no login e na visão pública.
export function LogoEmendas360({
  tamanho = 34,
  className,
}: {
  tamanho?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 48 48"
        style={{ width: tamanho, height: tamanho }}
        aria-label="Emendas 360"
      >
        <rect width="48" height="48" rx="12" fill="rgba(255,255,255,.08)" />
        <rect x="9.5" y="27" width="8" height="12" rx="2.2" fill="#00B4D8" />
        <rect x="20" y="19.5" width="8" height="19.5" rx="2.2" fill="#00CFC2" />
        <rect x="30.5" y="10" width="8" height="29" rx="2.2" fill="#00E5A0" />
      </svg>
      <span className="flex flex-col gap-0.5 leading-none">
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-brand-cyan">Emendas</span>
          <span className="text-brand-mint">360</span>
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[2px] text-[#9fb4d8]">
          Orçamento impositivo
        </span>
      </span>
    </span>
  );
}
