/*
  Warnings:

  - You are about to alter the column `price` on the `ProductHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "listId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ProductHistory" ("createdAt", "id", "listId", "price", "title") SELECT "createdAt", "id", "listId", "price", "title" FROM "ProductHistory";
DROP TABLE "ProductHistory";
ALTER TABLE "new_ProductHistory" RENAME TO "ProductHistory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
