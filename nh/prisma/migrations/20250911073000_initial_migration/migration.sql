-- CreateTable
CREATE TABLE "wholesale_markets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auctionCode" TEXT NOT NULL,
    "auctionName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "varieties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "varietyCode" TEXT NOT NULL,
    "varietyName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "origins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originCode" TEXT NOT NULL,
    "originName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "origin_infos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uniqueId" TEXT NOT NULL,
    "auctionCode" TEXT NOT NULL,
    "varietyCode" TEXT NOT NULL,
    "originCode" TEXT NOT NULL,
    "grade" TEXT,
    "weight" INTEGER,
    "quantity" INTEGER,
    "price" INTEGER,
    "saleDate" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "wholesale_markets_auctionCode_key" ON "wholesale_markets"("auctionCode");

-- CreateIndex
CREATE UNIQUE INDEX "varieties_varietyCode_key" ON "varieties"("varietyCode");

-- CreateIndex
CREATE UNIQUE INDEX "origins_originCode_key" ON "origins"("originCode");

-- CreateIndex
CREATE UNIQUE INDEX "origin_infos_uniqueId_key" ON "origin_infos"("uniqueId");
