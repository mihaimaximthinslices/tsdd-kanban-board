/*
  Warnings:

  - You are about to drop the column `taskAfter` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `taskBefore` on the `Task` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubtaskStatus" AS ENUM ('done', 'in_progress');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskAfter",
DROP COLUMN "taskBefore",
ADD COLUMN     "taskAfterId" TEXT,
ADD COLUMN     "taskBeforeId" TEXT;

-- CreateTable
CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SubtaskStatus" NOT NULL,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);
