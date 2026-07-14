
-- CreateEnum
CREATE TYPE "TipoBeneficiario" AS ENUM ('ORGAO_PUBLICO', 'ENTIDADE_TERCEIRO_SETOR', 'OUTRO');

-- AlterTable
ALTER TABLE "Emenda" ADD COLUMN     "beneficiarioId" TEXT;

-- CreateTable
CREATE TABLE "Beneficiario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoBeneficiario" NOT NULL DEFAULT 'OUTRO',
    "cnpj" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Beneficiario_tipo_idx" ON "Beneficiario"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiario_nome_key" ON "Beneficiario"("nome");

-- CreateIndex
CREATE INDEX "Emenda_beneficiarioId_idx" ON "Emenda"("beneficiarioId");

-- AddForeignKey
ALTER TABLE "Emenda" ADD CONSTRAINT "Emenda_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Beneficiario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

