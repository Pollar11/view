-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "matchNotifications" BOOLEAN NOT NULL DEFAULT true,
    "preferenceJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "year" INTEGER,
    "rating" REAL,
    "popularity" REAL NOT NULL DEFAULT 0,
    "posterUrl" TEXT,
    "releasedAt" DATETIME,
    "startsAt" DATETIME,
    "genresKey" TEXT NOT NULL DEFAULT '',
    "genresJson" TEXT NOT NULL DEFAULT '[]',
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "sourceId" TEXT NOT NULL,
    "sourceKind" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourcePageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SourceRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT NOT NULL DEFAULT '',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_slug_key" ON "Item"("slug");

-- CreateIndex
CREATE INDEX "Item_category_idx" ON "Item"("category");

-- CreateIndex
CREATE INDEX "Item_category_popularity_idx" ON "Item"("category", "popularity");

-- CreateIndex
CREATE INDEX "Item_startsAt_idx" ON "Item"("startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Item_sourceId_externalId_key" ON "Item"("sourceId", "externalId");

-- CreateIndex
CREATE INDEX "Interaction_userId_type_idx" ON "Interaction"("userId", "type");

-- CreateIndex
CREATE INDEX "Interaction_userId_itemId_idx" ON "Interaction"("userId", "itemId");

-- CreateIndex
CREATE INDEX "Interaction_itemId_type_idx" ON "Interaction"("itemId", "type");

-- CreateIndex
CREATE INDEX "SourceRun_sourceId_startedAt_idx" ON "SourceRun"("sourceId", "startedAt");
