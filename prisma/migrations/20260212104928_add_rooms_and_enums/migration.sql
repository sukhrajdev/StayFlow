/*
  Warnings:

  - The `type` column on the `rooms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[roomNumber]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `roomNumber` on the `rooms` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'DELUXE', 'SUPER_DELUXE', 'SUITE');

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "roomNumber",
ADD COLUMN     "roomNumber" INTEGER NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'SINGLE',
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "rooms_roomNumber_key" ON "rooms"("roomNumber");
