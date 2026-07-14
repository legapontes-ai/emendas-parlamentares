# Análise regulatória × sistema — o que falta no Emendas360

Fonte: deck "Emendas Parlamentares Impositivas" (Instituto i10, 16 slides —
`G:\Meu Drive\Better Educacion\I10 - ICT\Emendas Impositivas\Emendas_Parlamentares_Impositivas.html`).
O deck consolida as exigências do STF (ADI 7697, ADPF 854 — arts. 163-A e 166
§§9º/11 da CF), do MP-SP (inquérito civil e acompanhamento contínuo) e do
TCE-SP (SDG 28/2025, Resolução 17/2025, GP 43/2025, Audesp 55/2025, Audesp
09/2026 — conta específica por emenda, GP 15/2026). Cada exigência foi mapeada
contra o sistema em produção.

## 1. O que o sistema JÁ cobre

| Exigência (fonte) | Situação no sistema |
| --- | --- |
| Identificação do autor (STF/ADPF 854) | ✅ Autor por FK em toda emenda; nome, apelido e partido |
| Objeto e valor definidos (CF art. 166) | ✅ Campos obrigatórios; tipo de emenda |
| Compatibilidade com PPA/LDO/LOA (TCE) | ✅ Motor: PROGRAMA_NO_PPA, ADERENCIA_LDO, dotação restrita à base da LOA |
| Limites (cota, teto, reserva saúde) | ✅ Motor (10 checagens) + painéis com farol |
| Normas de referência (LOM art. 140/166, RI) | ✅ Aba Normas (DocumentoNormativo) |
| Parecer na tramitação | ⚠️ Parcial — aprovar/rejeitar exige parecer, mas ele vive no AuditLog (dívida registrada) |
| Trilha de auditoria (rastreabilidade interna) | ✅ AuditLog em toda mutação |
| Transparência pública | ⚠️ Parcial — /publica traz só agregados, sem busca/filtros por emenda |
| Relatórios/exportação | ⚠️ Parcial — CSV/XLSX e consolidado por programa; nada no padrão Audesp |
| Fiscalização legislativa | ⚠️ Parcial — tramitação e status; sem execução física/financeira |

## 2. Ferramentas que NÃO existem (gaps), priorizadas

### P0 — o que o TCE já aponta como "impropriedade" nas contas

1. **Portal público de emendas com busca e filtros** (STF: "transparência
   ativa, em meio eletrônico, com busca e filtros"; TCE item 04). Hoje a
   /publica mostra agregados. Falta: lista pública pesquisável (autor, área,
   beneficiário, status, exercício) + página pública por emenda com autor,
   objeto, valor, cronograma, status e documentos.
2. **Beneficiário final identificado** (rastreabilidade "ponta a ponta").
   Falta entidade Beneficiário (nome, CNPJ, tipo — órgão/entidade do 3º
   setor, habilitação) vinculada à emenda. Hoje o "destino" é aproximado pelo
   órgão da dotação.
3. **Manual orientativo + checklist de conformidade institucional** (TCE item
   03 e Comunicado GP 43/2025). Falta: página/documento "Manual de indicação e
   execução" e um "farol institucional" da Câmara (LOM ok? RI disciplina
   prazos/impedimento? manual publicado? rastreabilidade?) — espelho do
   questionário do TCE.

### P1 — ciclo de vida que o sistema ainda não modela

4. **Impedimento técnico** (CF art. 166 §11). Conceito central do regime
   impositivo ausente: registro estruturado do impedimento (fundamento,
   quem declarou, prazo para sanar, notificação ao autor, remanejamento).
   Novo status/entidade no ciclo da emenda.
5. **Plano de trabalho por emenda** (TCE: metas mensuráveis, custos,
   cronograma físico-financeiro). Falta entidade PlanoTrabalho + checagem no
   motor ("emenda sem plano de trabalho → alerta/bloqueio").
6. **Parecer de admissibilidade como documento** (análise técnica e jurídica
   formal antes da aprovação). Promover o parecer de texto no AuditLog a
   entidade própria (autor do parecer, fundamento, resultado, PDF).
7. **Anexos/documentos por emenda** (projeto técnico p/ obras, plano de
   trabalho, ofícios). Depende de storage (Vercel Blob — dívida registrada).

### P2 — fase de acompanhamento (Audesp 09/55)

8. **Execução financeira por emenda**: conta bancária específica (Audesp
   09/2026), empenho/liquidação/pagamento, rendimentos, contabilidade
   segregada. Hoje "Execução" mostra apenas consumo de teto por autor.
9. **Acompanhamento físico** da obra/serviço (% execução, marcos do
   cronograma, situação) para a "fiscalização contínua, não episódica".
10. **Alertas de controle interno**: pulverização (valor mínimo/nº máximo de
    itens — o TCE cita "dispersão de verbas" expressamente; candidata a
    checagem do motor), concentração em poucas entidades (painel já mostra;
    falta virar alerta parametrizável), sobrepreço/desvio de finalidade.
11. **Prestação de contas padrão Audesp** (Comunicado 55/2025): exportação
    estruturada por emenda para o TCE.
12. **Prazos regimentais** (RI: prazos de análise/admissibilidade): agenda e
    farol de prazos por etapa da tramitação.

### P3 — integridade (MP-SP)

13. **Módulo terceiro setor / conflito de interesses**: cadastro da entidade
    beneficiária com dirigentes e declaração de vínculo do parlamentar;
    dossiê por emenda (documentos + trilha + pareceres) exportável para
    responder inquérito civil.

## 3. Leitura estratégica

O deck organiza tudo em **duas fases** — planejamento (antes de aprovar) e
acompanhamento (durante/depois). O sistema cobre bem a primeira metade da
fase 1 (indicação, limites, compatibilidade, tramitação) e a transparência
agregada. Os maiores vazios são o **fim da fase 1** (plano de trabalho,
projeto técnico, parecer formal, impedimento) e **toda a fase 2** (conta
específica, execução física/financeira, prestação de contas) — além do
**portal público pesquisável**, que é a exigência mais visível e a que o
TCE já aponta como impropriedade.
