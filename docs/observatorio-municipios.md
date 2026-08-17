# Observatório de emendas impositivas municipais

Camada somente-leitura com emendas impositivas de **outros municípios paulistas**,
coletadas das fontes públicas que cada câmara/prefeitura já mantém (sistemas
legislativos e dados abertos). Serve de benchmark dentro do Emendas360 — mostra
como outras cidades praticam o orçamento impositivo — sem tocar no fluxo
operacional (Exercício/Dotação/Emenda) do município anfitrião.

## Como usar

```bash
npx prisma migrate deploy          # cria a tabela EmendaObservatorio
npm run coletar:observatorio       # coleta as 4 cidades (~9,7 mil emendas, ~30 min)
# ou uma cidade por vez:
npm run coletar:observatorio -- --cidade santos   # mogi | campinas | santos | paulinia
```

A página pública fica em **`/publica/observatorio`** (busca + filtros por
município/ano, link "ver na origem" para o documento oficial). O upsert é
idempotente por `(fonte, fonteId)` — re-executar só atualiza.

## Conectores do piloto (1 por fornecedor de sistema)

| Município | Fornecedor | Fonte | O que vem estruturado |
| --- | --- | --- | --- |
| Santos | Dados abertos da prefeitura | `egov.santos.sp.gov.br/dadosabertos` (JSON) | autor, **valor, beneficiário, órgão, saldo e pagamentos (execução)** |
| Campinas | SAPL (Interlegis) | `sapl.campinas.sp.leg.br/api` (REST) | autor, ementa com PL da LOA, situação, tipos 45/52 |
| Mogi Guaçu | SAGL (OpenLegis) | `sistema.camaramogiguacu.sp.gov.br` (JSON) | autor **com partido**, ementa, PDF do texto integral (`tip_id_basica=33`) |
| Paulínia | SISCAM | `paulinia.siscam.com.br` (HTML) | autor, assunto descritivo, data, link do documento (`Documento=525`) |

Cada conector é genérico do fornecedor: apontar para outra câmara que use o
mesmo sistema é trocar URL + código IBGE (e o id do tipo de matéria, quando
houver).

## Limitações conhecidas

- **Valor e beneficiário** só vêm estruturados em Santos; nas demais cidades
  estão dentro do PDF/documento da emenda (fase 2 natural: extração por IA dos
  PDFs — Mogi Guaçu já traz 1,6 mil PDFs linkados).
- Nem todo município tem o instituto: num censo de 13 câmaras SP, ~70% têm
  emenda impositiva (Piracicaba e São José dos Campos rejeitaram a emenda à LOM
  em 2024; Jundiaí mantém o recurso desligado no SAGL).
- O TCE-SP passou a exigir cadastro contábil das emendas no Audesp desde o
  balancete de abr/2026 (Resolução 17/2025) — quando esse dado virar dataset
  aberto, ele poderá substituir/conferir parte desta coleta.

## Modelo

`EmendaObservatorio` (Prisma): identificação (`codIbge`, `municipio`, `fonte`,
`fonteId` único composto), metadados (`numero`, `ano`, `dataApresentacao`,
`autor`, `partido`, `ementa`, `situacao`), execução quando disponível (`valor`,
`beneficiario`, `orgao`, `saldo`, `pago`), links (`urlDetalhe`, `urlPdf`) e o
payload bruto (`raw`).
