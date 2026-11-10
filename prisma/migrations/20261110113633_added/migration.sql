-- CreateTable
CREATE TABLE "Widget" (
    "id" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "widgetName" TEXT,
    "companyId" TEXT NOT NULL,
    "allowedDomains" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Widget_widgetId_key" ON "Widget"("widgetId");

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
