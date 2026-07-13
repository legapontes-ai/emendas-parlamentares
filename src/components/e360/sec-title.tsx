// Título de seção no padrão do mockup: h2 forte + barrinha de gradiente + nota.
export function SecTitle({
  titulo,
  nota,
  className,
}: {
  titulo: string;
  nota?: string;
  className?: string;
}) {
  return (
    <div className={`mb-3.5 mt-7 flex flex-wrap items-baseline gap-3 ${className ?? ""}`}>
      <h2 className="text-xl font-extrabold tracking-tight">{titulo}</h2>
      <span className="sec-bar self-center" aria-hidden />
      {nota ? <small className="text-[13px] text-muted-foreground">{nota}</small> : null}
    </div>
  );
}
