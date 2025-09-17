-- CreateTable
CREATE TABLE "varieties_infos_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketCode" TEXT NOT NULL,
    "varietyCode" TEXT NOT NULL,
    "originCode" TEXT,
    "grade" TEXT,
    "weight" REAL,
    "quantity" INTEGER,
    "price" INTEGER,
    "saleDate" DATETIME NOT NULL
);

-- CopyData
INSERT INTO "varieties_infos_new" ("id", "marketCode", "varietyCode", "originCode", "grade", "weight", "quantity", "price", "saleDate")
SELECT "id", "marketCode", "varietyCode", "originCode", "grade", CAST("weight" AS REAL), "quantity", "price", "saleDate"
FROM "varieties_infos";

-- DropTable
DROP TABLE "varieties_infos";

-- RenameTable
ALTER TABLE "varieties_infos_new" RENAME TO "varieties_infos";
