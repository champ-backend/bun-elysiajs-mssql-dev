BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[TiktokOrder] (
    [id] INT NOT NULL IDENTITY(1,1),
    [accountCode] BIGINT NOT NULL,
    [salesmanCode] INT NOT NULL,
    [purchaseOrder] NVARCHAR(20),
    [invoiceDate] DATETIME2 NOT NULL,
    [name] NVARCHAR(100),
    [name2] NVARCHAR(100),
    [address] NVARCHAR(max) NOT NULL,
    [address2] NVARCHAR(max),
    [address3] NVARCHAR(max),
    [postCode] VARCHAR(6) NOT NULL,
    [city] NVARCHAR(255) NOT NULL,
    [tel] NVARCHAR(255),
    [requireTaxInvoice] BIT,
    [taxId] NVARCHAR(16),
    [materialProductCode] NVARCHAR(255),
    [itemCat] NVARCHAR(255) NOT NULL,
    [quantity] INT NOT NULL,
    [mg4] NVARCHAR(255),
    [profitCenter] NVARCHAR(255),
    [UOM] NVARCHAR(255) NOT NULL,
    [plant] NVARCHAR(255) NOT NULL,
    [storageLocation] NVARCHAR(255) NOT NULL,
    [SORPrice] DECIMAL(10,2) NOT NULL,
    [orderStatus] NVARCHAR(255),
    [orderSubStatus] NVARCHAR(255),
    [cancelationReturnType] NVARCHAR(255),
    [normalReturnType] NVARCHAR(255),
    [normalOrPreOrder] NVARCHAR(255),
    [skuId] NVARCHAR(255),
    [productName] NVARCHAR(255),
    [variation] NVARCHAR(255),
    [skuQuantityOfReturn] INT,
    [skuUnitOriginalPrice] DECIMAL(10,2) NOT NULL,
    [skuSubtotalBeforeDiscount] DECIMAL(10,2) NOT NULL,
    [skuPlatformDiscount] DECIMAL(10,2) NOT NULL,
    [skuSellerDiscount] DECIMAL(10,2) NOT NULL,
    [shippingFeeAfterDiscount] DECIMAL(10,2) NOT NULL,
    [originalShippingFee] DECIMAL(10,2) NOT NULL,
    [shippingFeeSellerDiscount] DECIMAL(10,2) NOT NULL,
    [shippingFeePlatformDiscount] DECIMAL(10,2) NOT NULL,
    [taxes] NVARCHAR(255),
    [smallOrderFee] DECIMAL(10,2) NOT NULL,
    [orderAmount] DECIMAL(10,2) NOT NULL,
    [orderRefundAmount] DECIMAL(10,2) NOT NULL,
    [createdTime] DATETIME2,
    [rtsTime] DATETIME2,
    [shippedTime] DATETIME2,
    [deliveredTime] DATETIME2,
    [cancelledTime] DATETIME2,
    [cancelBy] NVARCHAR(255),
    [cancelReason] NVARCHAR(255),
    [fulfillmentType] NVARCHAR(255),
    [warehouseName] NVARCHAR(255),
    [trackingId] NVARCHAR(255),
    [deliveryOption] NVARCHAR(255),
    [shippingProviderName] NVARCHAR(255),
    [buyerMessage] NVARCHAR(255),
    [buyerUsername] NVARCHAR(255),
    [country] NVARCHAR(5),
    [district] NVARCHAR(255),
    [paymentMethod] NVARCHAR(255),
    [weight] DECIMAL(10,2) NOT NULL,
    [productCategory] NVARCHAR(255),
    [packageId] NVARCHAR(255),
    [sellerNote] NVARCHAR(255),
    [checkedStatus] NVARCHAR(50),
    [checkedMarkedBy] NVARCHAR(100),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TiktokOrder_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TiktokOrder_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TiktokOrder_purchaseOrder_name_materialProductCode_SORPrice_key] UNIQUE NONCLUSTERED ([purchaseOrder],[name],[materialProductCode],[SORPrice])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
