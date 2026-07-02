import { describe, expect, it } from "vitest";
import { csvParaLinhas } from "../parse";
import { validarDotacoes } from "../validar";

// Códigos com pontos (02.01, 3.3.90.30) são preservados; ver nota sobre zeros
// à esquerda em CSV no parse.ts.
const CSV = `orgao_codigo,orgao_nome,unidade_codigo,unidade_nome,funcao_codigo,funcao_nome,subfuncao_codigo,subfuncao_nome,programa_codigo,programa_nome,acao_codigo,acao_nome,acao_tipo,natureza_codigo,natureza_categoria,natureza_grupo,natureza_modalidade,natureza_elemento,fonte_codigo,fonte_nome,valor_inicial
02.1,Prefeitura,02.01,Gabinete,04,Administração,122,Adm Geral,1001,Gestão,2001,Manutenção,ATIVIDADE,3.3.90.30,3,3,90,30,500,Ordinários,1000`;

describe("csvParaLinhas", () => {
  it("lê o CSV em objetos com as chaves do cabeçalho", () => {
    const linhas = csvParaLinhas(CSV);
    expect(linhas).toHaveLength(1);
    expect(linhas[0].programa_codigo).toBe("1001");
  });

  it("integra parse + validação sem erros", () => {
    const linhas = csvParaLinhas(CSV);
    const { validas, erros } = validarDotacoes(linhas);
    expect(erros).toHaveLength(0);
    expect(validas).toHaveLength(1);
  });
});
