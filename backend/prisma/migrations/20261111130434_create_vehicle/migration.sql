-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_number_key" ON "Vehicle"("number");

-- CreateIndex
CREATE INDEX "Vehicle_category_idx" ON "Vehicle"("category");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");
