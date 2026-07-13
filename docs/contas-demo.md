# Contas de demonstração — Emendas360

Repertório de usuários de demonstração criados pelo seed (`src/lib/seed-data.ts`),
um para cada papel do sistema. **Senha padrão de todos: `mudar@123`.**

> Ambiente: produção (Vercel) — https://emendas-parlamentares.vercel.app/login
> Estas contas são fictícias, para demonstração. Troque as senhas antes de
> qualquer uso com dados reais.

## Transversal

| Perfil | Usuário (e-mail) | Senha | O que vê |
| --- | --- | --- | --- |
| Super Admin | `super@municipio.gov.br` | `mudar@123` | Todas as vistas e ferramentas (Painel, Tramitação, Emendas, Vereador 360, Análise, Resumo, Assistente, Ferramentas, Pitch, Configurações) |

## Executivo — Prefeitura

| Perfil | Usuário (e-mail) | Senha | O que vê |
| --- | --- | --- | --- |
| Executivo · Admin | `exec.admin@municipio.gov.br` | `mudar@123` | Painel, Tramitação, Emendas & Beneficiários, Resumo, Assistente, Pitch + Planejamento/Acompanhamento e Configurações |
| Executivo · Planejamento | `planejamento@municipio.gov.br` | `mudar@123` | Painel, Tramitação, Emendas & Beneficiários, Resumo, Assistente + Planejamento (instrumentos, base de dotações, lei aprovada) |
| Executivo · Consulta | `exec.consulta@municipio.gov.br` | `mudar@123` | Painel, Tramitação, Emendas & Beneficiários, Resumo, Assistente (somente leitura) |

## Legislativo — Câmara

| Perfil | Usuário (e-mail) | Senha | O que vê |
| --- | --- | --- | --- |
| Legislativo · Mesa | `mesa@camara.gov.br` | `mudar@123` | Visão da comissão completa (Painel, Tramitação, Emendas, Vereador 360, Análise Técnica com aprovar/rejeitar, Resumo, Assistente, Pitch) + Configurações |
| Legislativo · Técnico | `analista@camara.gov.br` | `mudar@123` | Visão da comissão (igual à Mesa, sem Configurações) — pode tramitar |
| Legislativo · Vereador(a) | `vereador@camara.gov.br` | `mudar@123` | Visão do gabinete: cai direto no **Vereador 360** (a própria cota), Emendas, Análise, Assistente + Nova emenda/Minhas emendas |
| Legislativo · Consulta | `leg.consulta@camara.gov.br` | `mudar@123` | Painel, Tramitação, Emendas, Vereador 360, Resumo, Assistente (somente leitura) |

## Visão sem login

| Persona | Acesso |
| --- | --- |
| Cidadão | https://emendas-parlamentares.vercel.app/publica — agregados em linguagem simples, sem autenticação |

## Notas

- O campo do formulário/API de login é **`senha`** (não `password`).
- Apenas o perfil Vereador tem um `Autor` vinculado (Vereador Exemplo) — é o
  único que apresenta emendas em nome próprio.
- As contas são recriadas/atualizadas de forma idempotente pelo seed; alterar a
  senha pelo banco será sobrescrito se o seed rodar de novo.
