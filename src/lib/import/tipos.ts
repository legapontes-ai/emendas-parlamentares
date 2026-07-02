// Tipos compartilhados do módulo de importação da base estruturada.

export type ErroLinha = { linha: number; motivo: string };

export type DotacaoRow = {
  orgaoCodigo: string;
  orgaoNome: string;
  unidadeCodigo: string;
  unidadeNome: string;
  funcaoCodigo: string;
  funcaoNome: string;
  subfuncaoCodigo: string;
  subfuncaoNome: string;
  programaCodigo: string;
  programaNome: string;
  acaoCodigo: string;
  acaoNome: string;
  acaoTipo: string;
  naturezaCodigo: string;
  naturezaCategoria: string;
  naturezaGrupo: string;
  naturezaModalidade: string;
  naturezaElemento: string;
  fonteCodigo: string;
  fonteNome: string;
  valorInicial: number;
};

export type PrioridadeRow = {
  programaCodigo: string;
  acaoCodigo: string | null;
  descricao: string;
};

// Componentes únicos derivados das linhas (chaveados por código).
export type Componentes = {
  orgaos: Map<string, { codigo: string; nome: string }>;
  unidades: Map<string, { codigo: string; nome: string; orgaoCodigo: string }>;
  funcoes: Map<string, { codigo: string; nome: string }>;
  subfuncoes: Map<string, { codigo: string; nome: string; funcaoCodigo: string }>;
  programas: Map<string, { codigo: string; nome: string }>;
  acoes: Map<string, { codigo: string; nome: string; tipo: string; programaCodigo: string }>;
  naturezas: Map<
    string,
    {
      codigo: string;
      categoriaEconomica: string;
      grupo: string;
      modalidadeAplicacao: string;
      elemento: string;
    }
  >;
  fontes: Map<string, { codigo: string; nome: string }>;
};

export type ResultadoValidacao<T> = {
  validas: T[];
  erros: ErroLinha[];
};
