-- CreateTable
CREATE TABLE "article" (
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "price" REAL DEFAULT 0,
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
CREATE TABLE "article_movements" (
    "article" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity_update" REAL DEFAULT 0,
    "reason" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "user" TEXT DEFAULT '',
    "store_in" TEXT DEFAULT '',
    "store_out" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "article_tags" (
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "article_tags_relations" (
    "article" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "tag" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "value" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "assemblies" (
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
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
CREATE TABLE "assemblies_buylists" (
    "assembly" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "project" TEXT DEFAULT '',
    "store" TEXT DEFAULT '',
    "closed" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "assemblies_buylists_replacement_relation" (
    "base_article" TEXT DEFAULT '',
    "buylist" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT 'strftime(''%Y-%m-%d %H:%M:%fZ'')',
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '''r''||lower(hex(randomblob(7)))',
    "quantity" DECIMAL DEFAULT 0,
    "replacement_article" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT 'strftime(''%Y-%m-%d %H:%M:%fZ'')'
);

-- CreateTable
CREATE TABLE "assemblies_relations" (
    "article_child" TEXT DEFAULT '',
    "assembly_child" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "parent" TEXT DEFAULT '',
    "quantity" DECIMAL DEFAULT 0,
    "updated" TEXT NOT NULL DEFAULT '',
    "order" DECIMAL DEFAULT 0
);

-- CreateTable
CREATE TABLE "crm_company" (
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

-- CreateTable
CREATE TABLE "crm_company_contact" (
    "address" TEXT DEFAULT '',
    "company_role" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "phone" TEXT DEFAULT '',
    "spoken_langs" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "company" TEXT DEFAULT '',
    "email" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "crm_interest" (
    "created" TEXT NOT NULL DEFAULT '',
    "description" TEXT DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "color" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "crm_leads" (
    "comment" TEXT DEFAULT '',
    "company" TEXT DEFAULT '',
    "company_contacts" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "origin" TEXT DEFAULT '',
    "state" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "crm_leads_interests" (
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "interest" TEXT DEFAULT '',
    "lead" TEXT DEFAULT '',
    "order" DECIMAL DEFAULT 0,
    "updated" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "fabrication_orders" (
    "applicant" TEXT DEFAULT '',
    "article" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "project" TEXT DEFAULT '',
    "quantity" REAL DEFAULT 0,
    "receiver" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "start_date" TEXT DEFAULT '',
    "end_date" TEXT DEFAULT '',
    "state" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "orders" (
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "issuer" TEXT DEFAULT '',
    "supplier" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT '',
    "name" TEXT DEFAULT '',
    "attached_files" TEXT DEFAULT '',
    "vat" DECIMAL DEFAULT 0,
    "delivery_fees" DECIMAL DEFAULT 0,
    "sub_id" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "orders_rows" (
    "article" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "needed_date" TEXT DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" TEXT DEFAULT '',
    "quantity" REAL DEFAULT 0,
    "updated" TEXT NOT NULL DEFAULT '',
    "project" TEXT DEFAULT '',
    "quantity_received" REAL DEFAULT 0,
    "ack_date" TEXT DEFAULT '',
    "ack_price" REAL DEFAULT 0
);

-- CreateTable
CREATE TABLE "projects" (
    "attached_users" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "end_date" TEXT DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "start_date" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "customer" TEXT DEFAULT '',
    "closed" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "stores" (
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT DEFAULT '',
    "name" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "temporary" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "stores_relations" (
    "article" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" DECIMAL DEFAULT 0,
    "store" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "suppliers" (
    "contact_email" TEXT DEFAULT '',
    "created" TEXT NOT NULL DEFAULT '',
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "address" TEXT DEFAULT '',
    "internal" BOOLEAN DEFAULT false,
    "website" TEXT DEFAULT '',
    "payment_rules" TEXT DEFAULT '',
    "thumbnail" TEXT DEFAULT '',
    "payment_rule" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL DEFAULT '',
    "emailVisibility" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT DEFAULT '',
    "updated" TEXT NOT NULL DEFAULT '',
    "created" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,
    CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Key" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "_nt4xjm0hr8j4m15_created_idx" ON "article"("created");

-- CreateIndex
CREATE INDEX "_92sdrzs64gj9juw_created_idx" ON "article_movements"("created");

-- CreateIndex
CREATE INDEX "_z0tacng3jw0735u_created_idx" ON "article_tags"("created");

-- CreateIndex
CREATE INDEX "_e8wsvbjx7mzq74w_created_idx" ON "article_tags_relations"("created");

-- CreateIndex
CREATE INDEX "_uws2nhereog5kvp_created_idx" ON "assemblies"("created");

-- CreateIndex
CREATE INDEX "_8511u98v8sq7w82_created_idx" ON "assemblies_buylists"("created");

-- CreateIndex
CREATE INDEX "_9fkqb7gwgcsubt7_created_idx" ON "assemblies_relations"("created");

-- CreateIndex
CREATE UNIQUE INDEX "idx_unique_uekhyfzz" ON "crm_company"("name");

-- CreateIndex
CREATE INDEX "_hpcza1xtofbf32u_created_idx" ON "crm_company"("created");

-- CreateIndex
CREATE INDEX "_s9sikvx18enu1n4_created_idx" ON "crm_company_contact"("created");

-- CreateIndex
CREATE INDEX "_906o32s8n1x48c9_created_idx" ON "crm_interest"("created");

-- CreateIndex
CREATE INDEX "_qqwhmu2ilwiapgl_created_idx" ON "crm_leads"("created");

-- CreateIndex
CREATE INDEX "_70sznq87hrb1cqt_created_idx" ON "crm_leads_interests"("created");

-- CreateIndex
CREATE INDEX "_is2ghc0l7l3dhs4_created_idx" ON "fabrication_orders"("created");

-- CreateIndex
CREATE UNIQUE INDEX "idx_unique_oixk8rv4" ON "orders"("sub_id");

-- CreateIndex
CREATE INDEX "_15utj1m1vqg6oms_created_idx" ON "orders"("created");

-- CreateIndex
CREATE INDEX "_koszbs3ev16yl63_created_idx" ON "orders_rows"("created");

-- CreateIndex
CREATE INDEX "_8lgxrj1l7qlrrfg_created_idx" ON "projects"("created");

-- CreateIndex
CREATE INDEX "_0xdwd5cf1bwl0ag_created_idx" ON "stores"("created");

-- CreateIndex
CREATE INDEX "_aaz8xjs45woxywq_created_idx" ON "stores_relations"("created");

-- CreateIndex
CREATE INDEX "_ubelnirh91lohfy_created_idx" ON "suppliers"("created");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "__pb_users_auth__username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Key_id_key" ON "Key"("id");

-- CreateIndex
CREATE INDEX "Key_user_id_idx" ON "Key"("user_id");
