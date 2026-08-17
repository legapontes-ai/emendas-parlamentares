-- CreateTable
CREATE TABLE "EmendaObservatorio" (
    "id" TEXT NOT NULL,
    "codIbge" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "fonteId" TEXT NOT NULL,
    "numero" INTEGER,
    "ano" INTEGER,
    "dataApresentacao" TIMESTAMP(3),
    "autor" TEXT,
    "partido" TEXT,
    "ementa" TEXT,
    "valor" DECIMAL(18,2),
    "beneficiario" TEXT,
    "orgao" TEXT,
    "saldo" DECIMAL(18,2),
    "pago" DECIMAL(18,2),
    "situacao" TEXT,
    "urlDetalhe" TEXT,
    "urlPdf" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmendaObservatorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmendaObservatorio_fonte_fonteId_key" ON "EmendaObservatorio"("fonte", "fonteId");

-- CreateIndex
CREATE INDEX "EmendaObservatorio_codIbge_idx" ON "EmendaObservatorio"("codIbge");

-- CreateIndex
CREATE INDEX "EmendaObservatorio_ano_idx" ON "EmendaObservatorio"("ano");

-- CreateIndex
CREATE INDEX "EmendaObservatorio_autor_idx" ON "EmendaObservatorio"("autor");
