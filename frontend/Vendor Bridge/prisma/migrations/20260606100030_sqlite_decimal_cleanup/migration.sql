/*
  Warnings:

  - You are about to drop the column `discount` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `unitPrice` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to drop the column `requiredQty` on the `RFQ` table. All the data in the column will be lost.
  - Added the required column `cgstAmount` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sgstAmount` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LineItem_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "approvalId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "cgst" DECIMAL NOT NULL DEFAULT 9.0,
    "sgst" DECIMAL NOT NULL DEFAULT 9.0,
    "cgstAmount" DECIMAL NOT NULL,
    "sgstAmount" DECIMAL NOT NULL,
    "totalAmount" DECIMAL NOT NULL,
    "deliveryDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseOrder_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrder_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrder_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "Approval" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseOrder" ("approvalId", "createdAt", "createdBy", "deliveryDate", "id", "poNumber", "quantity", "quotationId", "rfqId", "status", "totalAmount", "unitPrice", "updatedAt", "vendorId") SELECT "approvalId", "createdAt", "createdBy", "deliveryDate", "id", "poNumber", "quantity", "quotationId", "rfqId", "status", "totalAmount", "unitPrice", "updatedAt", "vendorId" FROM "PurchaseOrder";
DROP TABLE "PurchaseOrder";
ALTER TABLE "new_PurchaseOrder" RENAME TO "PurchaseOrder";
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");
CREATE UNIQUE INDEX "PurchaseOrder_quotationId_key" ON "PurchaseOrder"("quotationId");
CREATE UNIQUE INDEX "PurchaseOrder_approvalId_key" ON "PurchaseOrder"("approvalId");
CREATE INDEX "PurchaseOrder_vendorId_idx" ON "PurchaseOrder"("vendorId");
CREATE INDEX "PurchaseOrder_rfqId_idx" ON "PurchaseOrder"("rfqId");
CREATE INDEX "PurchaseOrder_quotationId_idx" ON "PurchaseOrder"("quotationId");
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");
CREATE TABLE "new_RFQ" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "expectedDeliveryDate" DATETIME NOT NULL,
    "deadline" DATETIME NOT NULL,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RFQ_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RFQ" ("attachments", "category", "createdAt", "createdBy", "deadline", "description", "expectedDeliveryDate", "id", "rfqNumber", "status", "title", "updatedAt") SELECT "attachments", "category", "createdAt", "createdBy", "deadline", "description", "expectedDeliveryDate", "id", "rfqNumber", "status", "title", "updatedAt" FROM "RFQ";
DROP TABLE "RFQ";
ALTER TABLE "new_RFQ" RENAME TO "RFQ";
CREATE UNIQUE INDEX "RFQ_rfqNumber_key" ON "RFQ"("rfqNumber");
CREATE INDEX "RFQ_createdBy_idx" ON "RFQ"("createdBy");
CREATE INDEX "RFQ_status_idx" ON "RFQ"("status");
CREATE INDEX "RFQ_deadline_idx" ON "RFQ"("deadline");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LineItem_rfqId_idx" ON "LineItem"("rfqId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_poId_idx" ON "Invoice"("poId");

-- CreateIndex
CREATE INDEX "Invoice_vendorId_idx" ON "Invoice"("vendorId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
