/*
  Warnings:

  - You are about to drop the column `actualCost` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `Project` table. All the data in the column will be lost.
  - Added the required column `projectValue` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "actualCost",
DROP COLUMN "budget",
ADD COLUMN     "projectValue" DOUBLE PRECISION NOT NULL;
