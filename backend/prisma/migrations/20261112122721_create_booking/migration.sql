-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "pickupLocation" TEXT,
    "dropoffLocation" TEXT,
    "totalDays" INTEGER NOT NULL,
    "dailyRate" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "advanceAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "bookingSource" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingId_key" ON "Booking"("bookingId");

-- CreateIndex
CREATE INDEX "Booking_customerId_idx" ON "Booking"("customerId");

-- CreateIndex
CREATE INDEX "Booking_vehicleId_idx" ON "Booking"("vehicleId");

-- CreateIndex
CREATE INDEX "Booking_pickupDate_returnDate_idx" ON "Booking"("pickupDate", "returnDate");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
