/*
  Warnings:

  - You are about to alter the column `amount` on the `RecurringTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - Added the required column `name` to the `RecurringTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecurringTransaction" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "incomeSource" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
