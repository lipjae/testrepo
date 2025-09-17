/*
  Warnings:

  - You are about to drop the column `uniqueId` on the `varieties_infos` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_varieties_infos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketCode" TEXT NOT NULL,
    "varietyCode" TEXT NOT NULL,
    "originCode" TEXT NOT NULL,
    "grade" TEXT,
    "weight" INTEGER,
    "quantity" INTEGER,
    "price" INTEGER,
    "saleDate" DATETIME NOT NULL
);
INSERT INTO "new_varieties_infos" ("grade", "id", "marketCode", "originCode", "price", "quantity", "saleDate", "varietyCode", "weight") SELECT "grade", "id", "marketCode", "originCode", "price", "quantity", "saleDate", "varietyCode", "weight" FROM "varieties_infos";
DROP TABLE "varieties_infos";
ALTER TABLE "new_varieties_infos" RENAME TO "varieties_infos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
