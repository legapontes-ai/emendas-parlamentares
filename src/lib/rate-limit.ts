// Rate limiting best-effort em memória (por instância). Suficiente para conter
// abusos triviais; para produção multi-instância, migrar para Upstash/Redis
// (dívida técnica registrada — PROMPT 11).
const janelas = new Map<string, number[]>();

export function rateLimit(
  chave: string,
  limite: number,
  janelaMs: number
): boolean {
  const agora = Date.now();
  const registros = (janelas.get(chave) ?? []).filter(
    (t) => agora - t < janelaMs
  );
  if (registros.length >= limite) {
    janelas.set(chave, registros);
    return false;
  }
  registros.push(agora);
  janelas.set(chave, registros);
  return true;
}
