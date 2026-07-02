-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Poder" AS ENUM ('LEGISLATIVO', 'EXECUTIVO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'EXEC_ADMIN', 'EXEC_PLANEJAMENTO', 'EXEC_CONSULTA', 'LEG_ADMIN', 'LEG_TECNICO', 'LEG_AUTOR', 'LEG_CONSULTA');

-- CreateEnum
CREATE TYPE "StatusExercicio" AS ENUM ('ABERTO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "TipoInstrumento" AS ENUM ('PPA', 'LDO', 'LOA');

-- CreateEnum
CREATE TYPE "EspecieInstrumento" AS ENUM ('PROJETO_LEI', 'LEI_APROVADA');

-- CreateEnum
CREATE TYPE "StatusInstrumento" AS ENUM ('EM_ELABORACAO', 'ENVIADO', 'EM_TRAMITACAO', 'APROVADO', 'SANCIONADO', 'VIGENTE', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "TipoAcao" AS ENUM ('PROJETO', 'ATIVIDADE', 'OPERACAO_ESPECIAL');

-- CreateEnum
CREATE TYPE "TipoNorma" AS ENUM ('LOM', 'REGIMENTO_INTERNO', 'OUTRO');

-- CreateEnum
CREATE TYPE "EscopoParametro" AS ENUM ('GERAL', 'EXERCICIO');

-- CreateEnum
CREATE TYPE "ModoValidacao" AS ENUM ('BLOQUEANTE', 'ALERTA');

-- CreateEnum
CREATE TYPE "TipoEmenda" AS ENUM ('ACRESCIMO', 'ANULACAO', 'REMANEJAMENTO', 'IMPOSITIVA');

-- CreateEnum
CREATE TYPE "StatusEmenda" AS ENUM ('RASCUNHO', 'EM_VALIDACAO', 'VALIDA', 'INVALIDA', 'SUBMETIDA', 'EM_TRAMITACAO', 'APROVADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "ResultadoValidacao" AS ENUM ('VALIDA', 'INVALIDA');

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "status" "StatusExercicio" NOT NULL DEFAULT 'ABERTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orgao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orgao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadeOrcamentaria" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "orgaoId" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnidadeOrcamentaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subfuncao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcaoId" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subfuncao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programa" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoAcao" NOT NULL,
    "programaId" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Acao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NaturezaDespesa" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "categoriaEconomica" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "modalidadeAplicacao" TEXT NOT NULL,
    "elemento" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NaturezaDespesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FonteRecurso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FonteRecurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrioridadeLDO" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "programaId" TEXT NOT NULL,
    "acaoId" TEXT,
    "exercicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrioridadeLDO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentoPlanejamento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoInstrumento" NOT NULL,
    "especie" "EspecieInstrumento" NOT NULL,
    "numero" TEXT NOT NULL,
    "ementa" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "status" "StatusInstrumento" NOT NULL DEFAULT 'EM_ELABORACAO',
    "arquivoUrl" TEXT,
    "dataEnvio" TIMESTAMP(3),
    "dataAprovacao" TIMESTAMP(3),
    "dataVigencia" TIMESTAMP(3),
    "instrumentoOrigemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentoPlanejamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dotacao" (
    "id" TEXT NOT NULL,
    "instrumentoId" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "orgaoId" TEXT NOT NULL,
    "unidadeOrcamentariaId" TEXT NOT NULL,
    "funcaoId" TEXT NOT NULL,
    "subfuncaoId" TEXT NOT NULL,
    "programaId" TEXT NOT NULL,
    "acaoId" TEXT NOT NULL,
    "naturezaDespesaId" TEXT NOT NULL,
    "fonteRecursoId" TEXT NOT NULL,
    "valorInicial" DECIMAL(18,2) NOT NULL,
    "valorAtual" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dotacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoNormativo" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNorma" NOT NULL,
    "titulo" TEXT NOT NULL,
    "numero" TEXT,
    "arquivoUrl" TEXT NOT NULL,
    "dataVigencia" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoNormativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParametroValidacao" (
    "id" TEXT NOT NULL,
    "escopo" "EscopoParametro" NOT NULL DEFAULT 'GERAL',
    "exercicioId" TEXT,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "modo" "ModoValidacao",
    "fundamentoNormaId" TEXT,
    "fundamentoDescricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParametroValidacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Autor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Autor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emenda" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "instrumentoBaseId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "dotacaoId" TEXT NOT NULL,
    "tipo" "TipoEmenda" NOT NULL,
    "objeto" TEXT NOT NULL,
    "justificativa" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "status" "StatusEmenda" NOT NULL DEFAULT 'RASCUNHO',
    "dotacaoOrigemId" TEXT,
    "dotacaoDestinoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidacaoEmenda" (
    "id" TEXT NOT NULL,
    "emendaId" TEXT NOT NULL,
    "resultado" "ResultadoValidacao" NOT NULL,
    "executadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itens" JSONB NOT NULL,

    CONSTRAINT "ValidacaoEmenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "poder" "Poder",
    "role" "Role" NOT NULL DEFAULT 'LEG_CONSULTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercicio_ano_key" ON "Exercicio"("ano");

-- CreateIndex
CREATE INDEX "Orgao_exercicioId_idx" ON "Orgao"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Orgao_exercicioId_codigo_key" ON "Orgao"("exercicioId", "codigo");

-- CreateIndex
CREATE INDEX "UnidadeOrcamentaria_orgaoId_idx" ON "UnidadeOrcamentaria"("orgaoId");

-- CreateIndex
CREATE INDEX "UnidadeOrcamentaria_exercicioId_idx" ON "UnidadeOrcamentaria"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadeOrcamentaria_exercicioId_orgaoId_codigo_key" ON "UnidadeOrcamentaria"("exercicioId", "orgaoId", "codigo");

-- CreateIndex
CREATE INDEX "Funcao_exercicioId_idx" ON "Funcao"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Funcao_exercicioId_codigo_key" ON "Funcao"("exercicioId", "codigo");

-- CreateIndex
CREATE INDEX "Subfuncao_funcaoId_idx" ON "Subfuncao"("funcaoId");

-- CreateIndex
CREATE INDEX "Subfuncao_exercicioId_idx" ON "Subfuncao"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Subfuncao_exercicioId_funcaoId_codigo_key" ON "Subfuncao"("exercicioId", "funcaoId", "codigo");

-- CreateIndex
CREATE INDEX "Programa_exercicioId_idx" ON "Programa"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Programa_exercicioId_codigo_key" ON "Programa"("exercicioId", "codigo");

-- CreateIndex
CREATE INDEX "Acao_programaId_idx" ON "Acao"("programaId");

-- CreateIndex
CREATE INDEX "Acao_exercicioId_idx" ON "Acao"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Acao_exercicioId_programaId_codigo_key" ON "Acao"("exercicioId", "programaId", "codigo");

-- CreateIndex
CREATE INDEX "NaturezaDespesa_exercicioId_idx" ON "NaturezaDespesa"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "NaturezaDespesa_exercicioId_codigo_key" ON "NaturezaDespesa"("exercicioId", "codigo");

-- CreateIndex
CREATE INDEX "FonteRecurso_exercicioId_idx" ON "FonteRecurso"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "FonteRecurso_exercicioId_codigo_key" ON "FonteRecurso"("exercicioId", "codigo");

-- CreateIndex
CREATE INDEX "PrioridadeLDO_programaId_idx" ON "PrioridadeLDO"("programaId");

-- CreateIndex
CREATE INDEX "PrioridadeLDO_acaoId_idx" ON "PrioridadeLDO"("acaoId");

-- CreateIndex
CREATE INDEX "PrioridadeLDO_exercicioId_idx" ON "PrioridadeLDO"("exercicioId");

-- CreateIndex
CREATE INDEX "InstrumentoPlanejamento_exercicioId_idx" ON "InstrumentoPlanejamento"("exercicioId");

-- CreateIndex
CREATE INDEX "InstrumentoPlanejamento_instrumentoOrigemId_idx" ON "InstrumentoPlanejamento"("instrumentoOrigemId");

-- CreateIndex
CREATE INDEX "InstrumentoPlanejamento_exercicioId_especie_status_idx" ON "InstrumentoPlanejamento"("exercicioId", "especie", "status");

-- CreateIndex
CREATE INDEX "Dotacao_instrumentoId_idx" ON "Dotacao"("instrumentoId");

-- CreateIndex
CREATE INDEX "Dotacao_exercicioId_idx" ON "Dotacao"("exercicioId");

-- CreateIndex
CREATE INDEX "Dotacao_programaId_idx" ON "Dotacao"("programaId");

-- CreateIndex
CREATE INDEX "Dotacao_acaoId_idx" ON "Dotacao"("acaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Dotacao_instrumentoId_orgaoId_unidadeOrcamentariaId_funcaoI_key" ON "Dotacao"("instrumentoId", "orgaoId", "unidadeOrcamentariaId", "funcaoId", "subfuncaoId", "programaId", "acaoId", "naturezaDespesaId", "fonteRecursoId");

-- CreateIndex
CREATE INDEX "DocumentoNormativo_tipo_idx" ON "DocumentoNormativo"("tipo");

-- CreateIndex
CREATE INDEX "DocumentoNormativo_ativo_idx" ON "DocumentoNormativo"("ativo");

-- CreateIndex
CREATE INDEX "ParametroValidacao_escopo_idx" ON "ParametroValidacao"("escopo");

-- CreateIndex
CREATE INDEX "ParametroValidacao_exercicioId_idx" ON "ParametroValidacao"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "ParametroValidacao_exercicioId_chave_key" ON "ParametroValidacao"("exercicioId", "chave");

-- CreateIndex
CREATE UNIQUE INDEX "Autor_usuarioId_key" ON "Autor"("usuarioId");

-- CreateIndex
CREATE INDEX "Autor_usuarioId_idx" ON "Autor"("usuarioId");

-- CreateIndex
CREATE INDEX "Emenda_exercicioId_idx" ON "Emenda"("exercicioId");

-- CreateIndex
CREATE INDEX "Emenda_instrumentoBaseId_idx" ON "Emenda"("instrumentoBaseId");

-- CreateIndex
CREATE INDEX "Emenda_autorId_idx" ON "Emenda"("autorId");

-- CreateIndex
CREATE INDEX "Emenda_dotacaoId_idx" ON "Emenda"("dotacaoId");

-- CreateIndex
CREATE INDEX "Emenda_status_idx" ON "Emenda"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Emenda_exercicioId_numero_key" ON "Emenda"("exercicioId", "numero");

-- CreateIndex
CREATE INDEX "ValidacaoEmenda_emendaId_idx" ON "ValidacaoEmenda"("emendaId");

-- CreateIndex
CREATE INDEX "ValidacaoEmenda_executadaEm_idx" ON "ValidacaoEmenda"("executadaEm");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_poder_idx" ON "User"("poder");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "AuditLog_usuarioId_idx" ON "AuditLog"("usuarioId");

-- CreateIndex
CREATE INDEX "AuditLog_entidade_entidadeId_idx" ON "AuditLog"("entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "AuditLog_criadoEm_idx" ON "AuditLog"("criadoEm");

-- AddForeignKey
ALTER TABLE "Orgao" ADD CONSTRAINT "Orgao_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadeOrcamentaria" ADD CONSTRAINT "UnidadeOrcamentaria_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadeOrcamentaria" ADD CONSTRAINT "UnidadeOrcamentaria_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funcao" ADD CONSTRAINT "Funcao_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subfuncao" ADD CONSTRAINT "Subfuncao_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "Funcao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subfuncao" ADD CONSTRAINT "Subfuncao_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programa" ADD CONSTRAINT "Programa_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acao" ADD CONSTRAINT "Acao_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acao" ADD CONSTRAINT "Acao_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NaturezaDespesa" ADD CONSTRAINT "NaturezaDespesa_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FonteRecurso" ADD CONSTRAINT "FonteRecurso_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrioridadeLDO" ADD CONSTRAINT "PrioridadeLDO_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrioridadeLDO" ADD CONSTRAINT "PrioridadeLDO_acaoId_fkey" FOREIGN KEY ("acaoId") REFERENCES "Acao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrioridadeLDO" ADD CONSTRAINT "PrioridadeLDO_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentoPlanejamento" ADD CONSTRAINT "InstrumentoPlanejamento_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentoPlanejamento" ADD CONSTRAINT "InstrumentoPlanejamento_instrumentoOrigemId_fkey" FOREIGN KEY ("instrumentoOrigemId") REFERENCES "InstrumentoPlanejamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_instrumentoId_fkey" FOREIGN KEY ("instrumentoId") REFERENCES "InstrumentoPlanejamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_unidadeOrcamentariaId_fkey" FOREIGN KEY ("unidadeOrcamentariaId") REFERENCES "UnidadeOrcamentaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "Funcao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_subfuncaoId_fkey" FOREIGN KEY ("subfuncaoId") REFERENCES "Subfuncao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_acaoId_fkey" FOREIGN KEY ("acaoId") REFERENCES "Acao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_naturezaDespesaId_fkey" FOREIGN KEY ("naturezaDespesaId") REFERENCES "NaturezaDespesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dotacao" ADD CONSTRAINT "Dotacao_fonteRecursoId_fkey" FOREIGN KEY ("fonteRecursoId") REFERENCES "FonteRecurso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParametroValidacao" ADD CONSTRAINT "ParametroValidacao_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParametroValidacao" ADD CONSTRAINT "ParametroValidacao_fundamentoNormaId_fkey" FOREIGN KEY ("fundamentoNormaId") REFERENCES "DocumentoNormativo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Autor" ADD CONSTRAINT "Autor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emenda" ADD CONSTRAINT "Emenda_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emenda" ADD CONSTRAINT "Emenda_instrumentoBaseId_fkey" FOREIGN KEY ("instrumentoBaseId") REFERENCES "InstrumentoPlanejamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emenda" ADD CONSTRAINT "Emenda_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emenda" ADD CONSTRAINT "Emenda_dotacaoId_fkey" FOREIGN KEY ("dotacaoId") REFERENCES "Dotacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emenda" ADD CONSTRAINT "Emenda_dotacaoOrigemId_fkey" FOREIGN KEY ("dotacaoOrigemId") REFERENCES "Dotacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emenda" ADD CONSTRAINT "Emenda_dotacaoDestinoId_fkey" FOREIGN KEY ("dotacaoDestinoId") REFERENCES "Dotacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidacaoEmenda" ADD CONSTRAINT "ValidacaoEmenda_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

