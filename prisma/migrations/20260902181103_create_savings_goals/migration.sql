/*
  Warnings:

  - You are about to alter the column `targetAmount` on the `SavingsGoal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `currentAmount` on the `SavingsGoal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "SavingsGoal" ALTER COLUMN "targetAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "currentAmount" SET DATA TYPE DECIMAL(65,30);
