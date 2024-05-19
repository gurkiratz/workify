/*
  Warnings:

  - A unique constraint covering the columns `[workerId,taskId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "amount" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_workerId_taskId_key" ON "Submission"("workerId", "taskId");
