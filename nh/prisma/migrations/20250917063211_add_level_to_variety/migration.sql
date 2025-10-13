/*
  Warnings:

  - Added the required column `level` to the `varieties` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_varieties" (
    "level" INTEGER NOT NULL,
    "varietyCode" TEXT NOT NULL PRIMARY KEY,
    "varietyName" TEXT NOT NULL
);
INSERT INTO "new_varieties" ("varietyCode", "varietyName") SELECT "varietyCode", "varietyName" FROM "varieties";
DROP TABLE "varieties";
ALTER TABLE "new_varieties" RENAME TO "varieties";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
