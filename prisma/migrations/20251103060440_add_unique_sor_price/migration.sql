/*
  Warnings:

  - A unique constraint covering the columns `[purchaseOrder,name,materialProductCode,SORPrice]` on the table `OrderTransactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[purchaseOrder,name,materialProductCode,SORPrice]` on the table `ShopeeOrder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[purchaseOrder,name,materialProductCode,SORPrice]` on the table `ShopifyOrder` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[OrderTransactions] DROP CONSTRAINT [OrderTransactions_purchaseOrder_name_materialProductCode_key];

-- DropIndex
ALTER TABLE [dbo].[ShopeeOrder] DROP CONSTRAINT [ShopeeOrder_purchaseOrder_name_materialProductCode_key];

-- DropIndex
ALTER TABLE [dbo].[ShopifyOrder] DROP CONSTRAINT [ShopifyOrder_purchaseOrder_name_materialProductCode_key];

-- CreateIndex
ALTER TABLE [dbo].[OrderTransactions] ADD CONSTRAINT [OrderTransactions_purchaseOrder_name_materialProductCode_SORPrice_key] UNIQUE NONCLUSTERED ([purchaseOrder], [name], [materialProductCode], [SORPrice]);

-- CreateIndex
ALTER TABLE [dbo].[ShopeeOrder] ADD CONSTRAINT [ShopeeOrder_purchaseOrder_name_materialProductCode_SORPrice_key] UNIQUE NONCLUSTERED ([purchaseOrder], [name], [materialProductCode], [SORPrice]);

-- CreateIndex
ALTER TABLE [dbo].[ShopifyOrder] ADD CONSTRAINT [ShopifyOrder_purchaseOrder_name_materialProductCode_SORPrice_key] UNIQUE NONCLUSTERED ([purchaseOrder], [name], [materialProductCode], [SORPrice]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
