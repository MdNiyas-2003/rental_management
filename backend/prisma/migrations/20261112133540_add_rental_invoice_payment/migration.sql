-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "actualPickupDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickupOdometer" INTEGER NOT NULL,
    "pickupFuelLevel" TEXT,
    "pickupCondition" TEXT,
    "pickupNotes" TEXT,
    "actualReturnDate" TIMESTAMP(3),
    "returnOdometer" INTEGER,
    "returnFuelLevel" TEXT,
    "returnCondition" TEXT,
    "returnNotes" TEXT,
    "totalDistance" INTEGER,
    "extraKm" INTEGER NOT NULL DEFAULT 0,
    "extraKmCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lateCharges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "damageCharges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fuelCharges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "finalAmount" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balanceAmount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rental_rentalId_key" ON "Rental"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_bookingId_key" ON "Rental"("bookingId");

-- CreateIndex
CREATE INDEX "Rental_status_idx" ON "Rental"("status");

-- CreateIndex
CREATE INDEX "Rental_actualPickupDate_idx" ON "Rental"("actualPickupDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_rentalId_key" ON "Invoice"("rentalId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
