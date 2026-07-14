// Agrupamento de beneficiários possivelmente duplicados — NÚCLEO PURO.
// A derivação a partir do objeto gera variantes da mesma entidade quando a
// grafia difere ("Santa Casa" × "Santa Casa de Misericórdia"). Este módulo
// sugere grupos; a mesclagem é sempre confirmada pelo usuário.

export type BenefItem = { id: string; nome: string; emendas: number };

export type GrupoDuplicado = {
  canonicalId: string;
  canonicalNome: string;
  membros: BenefItem[]; // inclui o canônico; ordenados por nº de emendas desc
};

// Normaliza para tokens comparáveis: sem acento, minúsculo, só alfanumérico.
export function tokens(nome: string): string[] {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// A é "contido" em B quando: A tem ≥2 tokens, mesmo primeiro token, e todos os
// tokens de A aparecem em B na mesma ordem (subsequência), com no máximo 2
// tokens extras em B. Pega prefixos ("Santa Casa" ⊂ "Santa Casa de
// Misericórdia") e infixos ("Hospital Tabajara Ramos" ⊂ "Hospital Municipal
// Tabajara Ramos"), sem agrupar por termo genérico solto nem nomes distantes.
function ehContido(a: string[], b: string[]): boolean {
  if (a.length < 2 || a.length >= b.length) return false;
  if (b.length - a.length > 2) return false;
  if (a[0] !== b[0]) return false;
  let i = 0;
  for (const t of b) {
    if (i < a.length && t === a[i]) i++;
  }
  return i === a.length;
}

// Union-find simples.
class UF {
  private pai: number[];
  constructor(n: number) {
    this.pai = Array.from({ length: n }, (_, i) => i);
  }
  find(x: number): number {
    while (this.pai[x] !== x) {
      this.pai[x] = this.pai[this.pai[x]];
      x = this.pai[x];
    }
    return x;
  }
  union(a: number, b: number) {
    this.pai[this.find(a)] = this.find(b);
  }
}

// Agrupa itens cujas grafias encadeiam por word-prefix. Retorna só grupos com
// 2+ membros. Canônico = mais emendas; empate → nome mais específico (mais
// tokens); empate → alfabético.
export function agruparDuplicados(itens: BenefItem[]): GrupoDuplicado[] {
  const toks = itens.map((b) => tokens(b.nome));
  const uf = new UF(itens.length);
  for (let i = 0; i < itens.length; i++) {
    for (let j = i + 1; j < itens.length; j++) {
      if (ehContido(toks[i], toks[j]) || ehContido(toks[j], toks[i])) {
        uf.union(i, j);
      }
    }
  }

  const porRaiz = new Map<number, number[]>();
  for (let i = 0; i < itens.length; i++) {
    const r = uf.find(i);
    porRaiz.set(r, [...(porRaiz.get(r) ?? []), i]);
  }

  const grupos: GrupoDuplicado[] = [];
  for (const idxs of porRaiz.values()) {
    if (idxs.length < 2) continue;
    const membros = idxs
      .map((i) => itens[i])
      .sort(
        (a, b) =>
          b.emendas - a.emendas ||
          tokens(b.nome).length - tokens(a.nome).length ||
          a.nome.localeCompare(b.nome, "pt-BR")
      );
    grupos.push({
      canonicalId: membros[0].id,
      canonicalNome: membros[0].nome,
      membros,
    });
  }
  // Grupos com mais itens primeiro (mais impactantes de resolver).
  return grupos.sort((a, b) => b.membros.length - a.membros.length);
}
