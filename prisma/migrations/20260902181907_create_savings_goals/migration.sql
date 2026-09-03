/*
  Warnings:

  - The values [ABANDONED] on the enum `SavingsGoalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SavingsGoalStatus_new" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."SavingsGoal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SavingsGoal" ALTER COLUMN "status" TYPE "SavingsGoalStatus_new" USING ("status"::text::"SavingsGoalStatus_new");
ALTER TYPE "SavingsGoalStatus" RENAME TO "SavingsGoalStatus_old";
ALTER TYPE "SavingsGoalStatus_new" RENAME TO "SavingsGoalStatus";
DROP TYPE "public"."SavingsGoalStatus_old";
ALTER TABLE "SavingsGoal" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;
