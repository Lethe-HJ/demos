-- CreateTable
CREATE TABLE "demos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iframeUrl" TEXT NOT NULL,
    "markdownUrl" TEXT,
    "techStack" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "demos_category_subcategory_idx" ON "demos"("category", "subcategory");
