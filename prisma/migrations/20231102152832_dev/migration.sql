/*
  Warnings:

  - You are about to drop the `article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `article_movements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `article_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `article_tags_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assemblies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assemblies_buylists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assemblies_buylists_replacement_relation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stores_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `emailVisibility` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_nt4xjm0hr8j4m15_created_idx";

-- DropIndex
DROP INDEX "_92sdrzs64gj9juw_created_idx";

-- DropIndex
DROP INDEX "_z0tacng3jw0735u_created_idx";

-- DropIndex
DROP INDEX "_e8wsvbjx7mzq74w_created_idx";

-- DropIndex
DROP INDEX "_uws2nhereog5kvp_created_idx";

-- DropIndex
DROP INDEX "_8511u98v8sq7w82_created_idx";

-- DropIndex
DROP INDEX "_0xdwd5cf1bwl0ag_created_idx";

-- DropIndex
DROP INDEX "_aaz8xjs45woxywq_created_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "article";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "article_movements";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "article_tags";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "article_tags_relations";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "assemblies";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "assemblies_buylists";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "assemblies_buylists_replacement_relation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "stores";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "stores_relations";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SCMArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "reference" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "manufacturer" TEXT DEFAULT '',
    "attached_files" TEXT DEFAULT '',
    "pinned_file" TEXT DEFAULT '',
    "quantity" REAL DEFAULT 0,
    "supplier" TEXT DEFAULT '',
    "order_quantity" REAL DEFAULT 0,
    "store" TEXT DEFAULT '',
    "critical_quantity" DECIMAL DEFAULT 0,
    "consumable" BOOLEAN DEFAULT false,
    "unit" TEXT DEFAULT '',
    "unit_quantity" DECIMAL DEFAULT 0,
    "non_physical" BOOLEAN DEFAULT false,
    "internal" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "SCMArticleMovements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "article_id" TEXT NOT NULL DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "quantity_update" REAL DEFAULT 0,
    "reason" TEXT DEFAULT '',
    "user_id" TEXT NOT NULL DEFAULT '',
    "store_in_id" TEXT DEFAULT '',
    "store_out_id" TEXT DEFAULT '',
    CONSTRAINT "SCMArticleMovements_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "SCMArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMArticleMovements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMArticleMovements_store_in_id_fkey" FOREIGN KEY ("store_in_id") REFERENCES "SCMStore" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMArticleMovements_store_out_id_fkey" FOREIGN KEY ("store_out_id") REFERENCES "SCMStore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SCMStore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "temporary" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "SCMStoresRelations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "article_id" TEXT NOT NULL DEFAULT '',
    "quantity" REAL NOT NULL DEFAULT 0,
    "store_id" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "SCMStoresRelations_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "SCMArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMStoresRelations_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "SCMStore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SCMAssemblies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" TEXT NOT NULL DEFAULT '',
    "name" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "description" TEXT DEFAULT '',
    "attached_files" TEXT DEFAULT '',
    "favorite" BOOLEAN DEFAULT false,
    "pinned_file" TEXT DEFAULT '',
    "assembly_time" DECIMAL DEFAULT 0,
    "thumbnail" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "SCMAssembliesBuylists" (
    "assembly" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "project" TEXT DEFAULT '',
    "store" TEXT DEFAULT '',
    "closed" BOOLEAN DEFAULT false
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL DEFAULT '',
    "username" TEXT NOT NULL,
    "avatar" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "created" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("avatar", "created", "email", "id", "updated", "username") SELECT "avatar", "created", "email", "id", "updated", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "__pb_users_auth__username_idx" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "SCMArticleMovements_id_key" ON "SCMArticleMovements"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMStore_id_key" ON "SCMStore"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMStoresRelations_id_key" ON "SCMStoresRelations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMAssemblies_id_key" ON "SCMAssemblies"("id");

-- CreateIndex
CREATE INDEX "_8511u98v8sq7w82_created_idx" ON "SCMAssembliesBuylists"("created");
