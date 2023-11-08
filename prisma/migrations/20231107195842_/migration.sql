/*
  Warnings:

  - You are about to drop the `SCMAssemblies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SCMAssembliesBuylists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SCMStoresRelations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assemblies_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fabrication_orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders_rows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `created` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `updated` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to drop the column `attached_files` on the `SCMArticle` table. All the data in the column will be lost.
  - You are about to drop the column `created` on the `SCMArticle` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `SCMArticle` table. All the data in the column will be lost.
  - You are about to drop the column `pinned_file` on the `SCMArticle` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `SCMArticle` table. All the data in the column will be lost.
  - You are about to drop the column `store` on the `SCMArticle` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `SCMArticle` table. All the data in the column will be lost.
  - You are about to drop the column `updated` on the `SCMArticle` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "SCMAssemblies_id_key";

-- DropIndex
DROP INDEX "_8511u98v8sq7w82_created_idx";

-- DropIndex
DROP INDEX "SCMStoresRelations_id_key";

-- DropIndex
DROP INDEX "_9fkqb7gwgcsubt7_created_idx";

-- DropIndex
DROP INDEX "_hpcza1xtofbf32u_created_idx";

-- DropIndex
DROP INDEX "idx_unique_uekhyfzz";

-- DropIndex
DROP INDEX "_is2ghc0l7l3dhs4_created_idx";

-- DropIndex
DROP INDEX "_15utj1m1vqg6oms_created_idx";

-- DropIndex
DROP INDEX "idx_unique_oixk8rv4";

-- DropIndex
DROP INDEX "_koszbs3ev16yl63_created_idx";

-- DropIndex
DROP INDEX "_8lgxrj1l7qlrrfg_created_idx";

-- DropIndex
DROP INDEX "_ubelnirh91lohfy_created_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SCMAssemblies";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SCMAssembliesBuylists";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SCMStoresRelations";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "assemblies_relations";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "crm_company";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "fabrication_orders";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "orders";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "orders_rows";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "projects";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "suppliers";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SCMSupplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "logo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "payment_rule" TEXT
);

-- CreateTable
CREATE TABLE "SCMStoreRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "article_id" TEXT NOT NULL DEFAULT '',
    "quantity" REAL NOT NULL DEFAULT 0,
    "store_id" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "SCMStoreRelation_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "SCMArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMStoreRelation_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "SCMStore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SCMAssembly" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assembly_time" REAL NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SCMAssemblyRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parent_id" TEXT NOT NULL DEFAULT '',
    "article_child_id" TEXT DEFAULT '',
    "assembly_child_id" TEXT DEFAULT '',
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" REAL NOT NULL DEFAULT 0,
    "updated" DATETIME NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SCMAssemblyRelation_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "SCMAssembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMAssemblyRelation_article_child_id_fkey" FOREIGN KEY ("article_child_id") REFERENCES "SCMArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMAssemblyRelation_assembly_child_id_fkey" FOREIGN KEY ("assembly_child_id") REFERENCES "SCMAssembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SCMAssemblyBuylists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "assembly_id" TEXT NOT NULL DEFAULT '',
    "project_id" TEXT DEFAULT '',
    "store_id" TEXT NOT NULL DEFAULT '',
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SCMAssemblyBuylists_assembly_id_fkey" FOREIGN KEY ("assembly_id") REFERENCES "SCMAssembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMAssemblyBuylists_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "SCMProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SCMProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" DATETIME,
    "start_date" DATETIME,
    "customer" TEXT,
    "closed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "SCMProjetAttachedUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "SCMProjetAttachedUser_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "SCMProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMProjetAttachedUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SCMOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "issuer_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'draft',
    "name" TEXT NOT NULL,
    "vat" DECIMAL NOT NULL DEFAULT 0,
    "delivery_fees" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "SCMOrder_issuer_id_fkey" FOREIGN KEY ("issuer_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMOrder_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "SCMSupplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SCMOrderRows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "order_id" TEXT NOT NULL,
    "project_id" TEXT,
    "article_id" TEXT NOT NULL,
    "needed_date" DATETIME,
    "needed_quantity" REAL NOT NULL DEFAULT 0,
    "ack_date" DATETIME,
    "ack_price" REAL DEFAULT 0,
    "received_quantity" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "SCMOrderRows_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "SCMOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMOrderRows_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "SCMProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SCMOrderRows_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "SCMArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SCMFabricationOrders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicant" TEXT DEFAULT '',
    "article" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "project" TEXT DEFAULT '',
    "quantity" REAL DEFAULT 0,
    "receiver" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "start_date" TEXT DEFAULT '',
    "end_date" TEXT DEFAULT '',
    "state" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "CRMCompany" (
    "country" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "field" TEXT DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "sector" TEXT DEFAULT '',
    "size" TEXT DEFAULT '',
    "type" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT ''
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "updated" DATETIME NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("avatar", "created", "email", "id", "updated", "username") SELECT "avatar", "created", "email", "id", "updated", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_SCMArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "brand" TEXT DEFAULT '',
    "reference" TEXT DEFAULT '',
    "order_quantity" REAL NOT NULL DEFAULT 0,
    "critical_quantity" DECIMAL NOT NULL DEFAULT 0,
    "consumable" BOOLEAN NOT NULL DEFAULT false,
    "non_physical" BOOLEAN NOT NULL DEFAULT false,
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT DEFAULT '',
    "unit_quantity" DECIMAL DEFAULT 0
);
INSERT INTO "new_SCMArticle" ("consumable", "critical_quantity", "id", "internal", "name", "non_physical", "order_quantity", "reference", "unit", "unit_quantity") SELECT coalesce("consumable", false) AS "consumable", coalesce("critical_quantity", 0) AS "critical_quantity", "id", coalesce("internal", false) AS "internal", "name", coalesce("non_physical", false) AS "non_physical", coalesce("order_quantity", 0) AS "order_quantity", "reference", "unit", "unit_quantity" FROM "SCMArticle";
DROP TABLE "SCMArticle";
ALTER TABLE "new_SCMArticle" RENAME TO "SCMArticle";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "SCMSupplier_id_key" ON "SCMSupplier"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMStoreRelation_id_key" ON "SCMStoreRelation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMAssembly_id_key" ON "SCMAssembly"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMAssemblyRelation_id_key" ON "SCMAssemblyRelation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMAssemblyBuylists_id_key" ON "SCMAssemblyBuylists"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMProject_id_key" ON "SCMProject"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMProjetAttachedUser_id_key" ON "SCMProjetAttachedUser"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMOrder_id_key" ON "SCMOrder"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMOrderRows_id_key" ON "SCMOrderRows"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SCMFabricationOrders_id_key" ON "SCMFabricationOrders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_unique_uekhyfzz" ON "CRMCompany"("name");

-- CreateIndex
CREATE INDEX "_hpcza1xtofbf32u_created_idx" ON "CRMCompany"("created");
