/*
  Warnings:

  - You are about to drop the `origin_infos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `createdAt` on the `origins` table. All the data in the column will be lost.
  - You are about to drop the column `originCode` on the `origins` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `origins` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `varieties` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `varieties` table. All the data in the column will be lost.
  - You are about to drop the column `auctionCode` on the `wholesale_markets` table. All the data in the column will be lost.
  - You are about to drop the column `auctionName` on the `wholesale_markets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `wholesale_markets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `wholesale_markets` table. All the data in the column will be lost.
  - Added the required column `marketCode` to the `wholesale_markets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketName` to the `wholesale_markets` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "origin_infos_uniqueId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "origin_infos";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "varieties_infos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uniqueId" TEXT NOT NULL,
    "marketCode" TEXT NOT NULL,
    "varietyCode" TEXT NOT NULL,
    "originCode" TEXT NOT NULL,
    "grade" TEXT,
    "weight" INTEGER,
    "quantity" INTEGER,
    "price" INTEGER,
    "saleDate" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_origins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originName" TEXT NOT NULL
);
INSERT INTO "new_origins" ("id", "originName") SELECT "id", "originName" FROM "origins";
DROP TABLE "origins";
ALTER TABLE "new_origins" RENAME TO "origins";
CREATE TABLE "new_varieties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "varietyCode" TEXT NOT NULL,
    "varietyName" TEXT NOT NULL
);
INSERT INTO "new_varieties" ("id", "varietyCode", "varietyName") SELECT "id", "varietyCode", "varietyName" FROM "varieties";
DROP TABLE "varieties";
ALTER TABLE "new_varieties" RENAME TO "varieties";
CREATE UNIQUE INDEX "varieties_varietyCode_key" ON "varieties"("varietyCode");
CREATE TABLE "new_wholesale_markets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketCode" TEXT NOT NULL,
    "marketName" TEXT NOT NULL
);
INSERT INTO "new_wholesale_markets" ("id") SELECT "id" FROM "wholesale_markets";
DROP TABLE "wholesale_markets";
ALTER TABLE "new_wholesale_markets" RENAME TO "wholesale_markets";
CREATE UNIQUE INDEX "wholesale_markets_marketCode_key" ON "wholesale_markets"("marketCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "varieties_infos_uniqueId_key" ON "varieties_infos"("uniqueId");
