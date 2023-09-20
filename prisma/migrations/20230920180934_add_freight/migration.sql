-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "listId" TEXT NOT NULL,
    "freight" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ProductHistory" ("createdAt", "id", "listId", "price", "title") SELECT "createdAt", "id", "listId", "price", "title" FROM "ProductHistory";
DROP TABLE "ProductHistory";
ALTER TABLE "new_ProductHistory" RENAME TO "ProductHistory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
