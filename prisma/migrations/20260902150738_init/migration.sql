/*
  Warnings:

  - A unique constraint covering the columns `[secret_key]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_secret_key_key" ON "User"("secret_key");
