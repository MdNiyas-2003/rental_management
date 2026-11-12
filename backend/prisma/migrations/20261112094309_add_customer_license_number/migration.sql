/*
  Warnings:

  - You are about to drop the column `licenseNumber` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[licenseNumber]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_licenseNumber_key";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "licenseNumber" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "licenseNumber";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_licenseNumber_key" ON "Customer"("licenseNumber");
