/*
  Warnings:

  - The primary key for the `origins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `origins` table. All the data in the column will be lost.
  - The primary key for the `varieties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `varieties` table. All the data in the column will be lost.
  - The primary key for the `wholesale_markets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `wholesale_markets` table. All the data in the column will be lost.
  - The required column `originCode` was added to the `origins` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_origins" (
    "originCode" TEXT NOT NULL PRIMARY KEY,
    "originName" TEXT NOT NULL
);
INSERT INTO "new_origins" ("originName") SELECT "originName" FROM "origins";
DROP TABLE "origins";
ALTER TABLE "new_origins" RENAME TO "origins";
CREATE TABLE "new_varieties" (
    "varietyCode" TEXT NOT NULL PRIMARY KEY,
    "varietyName" TEXT NOT NULL
);
INSERT INTO "new_varieties" ("varietyCode", "varietyName") SELECT "varietyCode", "varietyName" FROM "varieties";
DROP TABLE "varieties";
ALTER TABLE "new_varieties" RENAME TO "varieties";
CREATE TABLE "new_wholesale_markets" (
    "marketCode" TEXT NOT NULL PRIMARY KEY,
    "marketName" TEXT NOT NULL
);
INSERT INTO "new_wholesale_markets" ("marketCode", "marketName") SELECT "marketCode", "marketName" FROM "wholesale_markets";
DROP TABLE "wholesale_markets";
ALTER TABLE "new_wholesale_markets" RENAME TO "wholesale_markets";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
