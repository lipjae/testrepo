/*
  Warnings:

  - You are about to alter the column `saleDate` on the `origin_infos` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_origin_infos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uniqueId" TEXT NOT NULL,
    "auctionCode" TEXT NOT NULL,
    "varietyCode" TEXT NOT NULL,
    "originCode" TEXT NOT NULL,
    "grade" TEXT,
    "weight" INTEGER,
    "quantity" INTEGER,
    "price" INTEGER,
    "saleDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_origin_infos" ("auctionCode", "createdAt", "grade", "id", "originCode", "price", "quantity", "saleDate", "uniqueId", "updatedAt", "varietyCode", "weight") SELECT "auctionCode", "createdAt", "grade", "id", "originCode", "price", "quantity", "saleDate", "uniqueId", "updatedAt", "varietyCode", "weight" FROM "origin_infos";
DROP TABLE "origin_infos";
ALTER TABLE "new_origin_infos" RENAME TO "origin_infos";
CREATE UNIQUE INDEX "origin_infos_uniqueId_key" ON "origin_infos"("uniqueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
