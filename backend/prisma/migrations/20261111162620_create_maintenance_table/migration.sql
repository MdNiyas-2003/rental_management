-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "maintenanceId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "nextServiceDate" TIMESTAMP(3),
    "odometer" INTEGER NOT NULL,
    "serviceProvider" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Maintenance_maintenanceId_key" ON "Maintenance"("maintenanceId");

-- CreateIndex
CREATE INDEX "Maintenance_vehicleId_idx" ON "Maintenance"("vehicleId");

-- CreateIndex
CREATE INDEX "Maintenance_serviceDate_idx" ON "Maintenance"("serviceDate");

-- CreateIndex
CREATE INDEX "Maintenance_status_idx" ON "Maintenance"("status");

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
