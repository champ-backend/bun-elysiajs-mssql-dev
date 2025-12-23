BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [firstname] NVARCHAR(150) NOT NULL,
    [lastname] NVARCHAR(150) NOT NULL,
    [password] NVARCHAR(100) NOT NULL,
    [role] NVARCHAR(10) NOT NULL,
    [salt] NVARCHAR(50) NOT NULL,
    [verifyCode] NVARCHAR(100) NOT NULL,
    [status] NVARCHAR(10) NOT NULL CONSTRAINT [User_status_df] DEFAULT 'ACTIVE',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [refreshToken] NVARCHAR(100) NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[Profile] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    CONSTRAINT [Profile_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Profile_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[DeviceInformation] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ipAddress] NVARCHAR(50) NOT NULL,
    [accessToken] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DeviceInformation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT,
    [tokenType] NVARCHAR(10) NOT NULL,
    CONSTRAINT [DeviceInformation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[FileUpload] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fileKey] NVARCHAR(255) NOT NULL,
    [fileName] NVARCHAR(100) NOT NULL,
    [type] NVARCHAR(100) NOT NULL,
    [path] NVARCHAR(255) NOT NULL,
    [size] FLOAT(53) NOT NULL,
    [url] NVARCHAR(255) NOT NULL,
    [isPublic] BIT NOT NULL CONSTRAINT [FileUpload_isPublic_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FileUpload_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    [salesPlatformId] INT,
    CONSTRAINT [FileUpload_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FileUpload_fileKey_key] UNIQUE NONCLUSTERED ([fileKey])
);

-- CreateTable
CREATE TABLE [dbo].[SalesPlatform] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(50) NOT NULL,
    [status] NVARCHAR(10) NOT NULL CONSTRAINT [SalesPlatform_status_df] DEFAULT 'ACTIVE',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SalesPlatform_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [SalesPlatform_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [SalesPlatform_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[ProductMaster] (
    [id] INT NOT NULL IDENTITY(1,1),
    [plant] NVARCHAR(20),
    [material] NVARCHAR(255) NOT NULL,
    [materialNumber] NVARCHAR(255),
    [mg1] NVARCHAR(20),
    [mg2] NVARCHAR(20),
    [profitCenter] NVARCHAR(20),
    [baseUnit] NVARCHAR(20),
    [materialType] NVARCHAR(20),
    [profile] NVARCHAR(255),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ProductMaster_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ProductMaster_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ProductMaster_material_key] UNIQUE NONCLUSTERED ([material])
);

-- CreateTable
CREATE TABLE [dbo].[MaterialGroup] (
    [id] INT NOT NULL IDENTITY(1,1),
    [profitCenter] NVARCHAR(20) NOT NULL,
    [mg4] NVARCHAR(20) NOT NULL,
    [materialGroup4] NVARCHAR(50) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MaterialGroup_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [MaterialGroup_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MaterialGroup_mg4_key] UNIQUE NONCLUSTERED ([mg4])
);

-- CreateTable
CREATE TABLE [dbo].[OrderTransactions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [accountCode] BIGINT NOT NULL,
    [salesmanCode] INT NOT NULL,
    [purchaseOrder] NVARCHAR(20),
    [invoiceDate] DATETIME2 NOT NULL,
    [name] NVARCHAR(100),
    [address] NVARCHAR(max) NOT NULL,
    [address2] NVARCHAR(max),
    [postCode] VARCHAR(10) NOT NULL,
    [city] NVARCHAR(255) NOT NULL,
    [country] NVARCHAR(5),
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
    [totalPrice] DECIMAL(10,2) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [OrderTransactions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT,
    [salesPlatformId] INT,
    CONSTRAINT [OrderTransactions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [OrderTransactions_purchaseOrder_name_materialProductCode_key] UNIQUE NONCLUSTERED ([purchaseOrder],[name],[materialProductCode])
);

-- CreateTable
CREATE TABLE [dbo].[ShopeeOrder] (
    [id] INT NOT NULL IDENTITY(1,1),
    [accountCode] BIGINT NOT NULL,
    [salesmanCode] INT NOT NULL,
    [purchaseOrder] NVARCHAR(20),
    [invoiceDate] DATETIME2 NOT NULL,
    [name] NVARCHAR(100),
    [address] NVARCHAR(max) NOT NULL,
    [address2] NVARCHAR(max),
    [postCode] VARCHAR(10) NOT NULL,
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
    [invoiceEmail] NVARCHAR(255),
    [orderStatus] NVARCHAR(255),
    [refundStatus] NVARCHAR(255),
    [buyerName] NVARCHAR(255),
    [orderDate] DATETIME2,
    [paymentMethod] NVARCHAR(255),
    [paymentDetails] NVARCHAR(255),
    [installmentPlan] NVARCHAR(255),
    [transactionFeePercent] NVARCHAR(255),
    [shippingOption] NVARCHAR(255),
    [shippingMethod] NVARCHAR(255),
    [trackingNumber] NVARCHAR(255),
    [estimatedDeliveryDate] DATETIME2,
    [deliveryTime] NVARCHAR(255),
    [parentSku] NVARCHAR(255),
    [productName] NVARCHAR(255),
    [optionName] NVARCHAR(255),
    [originalPrice] DECIMAL(10,2),
    [salePrice] DECIMAL(10,2),
    [returnedQuantity] INT,
    [netSalePrice] DECIMAL(10,2),
    [shopeeDiscount] DECIMAL(10,2),
    [sellerVoucher] DECIMAL(10,2),
    [coinsCashbackSeller] DECIMAL(10,2),
    [shopeeVoucher] DECIMAL(10,2),
    [discountCode] NVARCHAR(255),
    [bundleDeal] NVARCHAR(255),
    [bundleDiscountSeller] DECIMAL(10,2),
    [bundleDiscountShopee] DECIMAL(10,2),
    [coinsUsed] DECIMAL(10,2),
    [allPaymentPromotions] DECIMAL(10,2),
    [commissionFee] DECIMAL(10,2),
    [transactionFee] DECIMAL(10,2),
    [totalBuyerPaid] DECIMAL(10,2),
    [shippingFeeBuyer] DECIMAL(10,2),
    [shippingFeeShopee] DECIMAL(10,2),
    [returnShippingFee] DECIMAL(10,2),
    [serviceFee] DECIMAL(10,2),
    [totalAmount] DECIMAL(10,2),
    [estimatedShippingFee] DECIMAL(10,2),
    [receiverName] NVARCHAR(255),
    [buyerNote] NVARCHAR(255),
    [shippingCountry] NVARCHAR(255),
    [shippingDistrict] NVARCHAR(255),
    [orderType] NVARCHAR(255),
    [orderSuccessTime] NVARCHAR(255),
    [orderNotes] NVARCHAR(255),
    [buyerInvoiceRequest] NVARCHAR(255),
    [invoiceType] NVARCHAR(255),
    [invoiceName] NVARCHAR(255),
    [invoiceBranchType] NVARCHAR(255),
    [invoiceBranchName] NVARCHAR(255),
    [invoiceBranchCode] NVARCHAR(255),
    [invoiceFullAddress] NVARCHAR(255),
    [invoiceAddressDetails] NVARCHAR(255),
    [invoiceSubDistrict] NVARCHAR(255),
    [invoiceDistrict] NVARCHAR(255),
    [invoiceProvince] NVARCHAR(255),
    [invoicePostalCode] NVARCHAR(255),
    [taxpayerId] NVARCHAR(255),
    [invoicePhoneNumber] NVARCHAR(255),
    [category] NVARCHAR(255),
    [SOR_ApasNumber] NVARCHAR(255),
    [codeSales] NVARCHAR(255),
    [invoiceReceipt] NVARCHAR(255),
    [shippingAddress] NVARCHAR(255),
    [receiverPhone] NVARCHAR(255),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ShopeeOrder_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ShopeeOrder_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ShopeeOrder_purchaseOrder_name_materialProductCode_key] UNIQUE NONCLUSTERED ([purchaseOrder],[name],[materialProductCode])
);

-- CreateTable
CREATE TABLE [dbo].[ShopifyOrder] (
    [id] INT NOT NULL IDENTITY(1,1),
    [accountCode] BIGINT NOT NULL,
    [salesmanCode] INT NOT NULL,
    [purchaseOrder] NVARCHAR(20),
    [invoiceDate] DATETIME2 NOT NULL,
    [name] NVARCHAR(100),
    [address] NVARCHAR(max) NOT NULL,
    [address2] NVARCHAR(max),
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
    [orderName] NVARCHAR(255),
    [email] NVARCHAR(255),
    [financialStatus] NVARCHAR(255),
    [fulfillmentStatus] NVARCHAR(255),
    [fulfilledAt] DATETIME2,
    [acceptsMarketing] NVARCHAR(255),
    [currency] NVARCHAR(255),
    [subtotal] DECIMAL(10,2),
    [shipping] DECIMAL(10,2),
    [taxes] DECIMAL(10,2),
    [discountCode] NVARCHAR(255),
    [discountAmount] DECIMAL(10,2),
    [shippingMethod] NVARCHAR(255),
    [orderCreatedAt] DATETIME2,
    [lineitemName] NVARCHAR(255),
    [lineitemPrice] DECIMAL(10,2),
    [lineitemCompareAtPrice] DECIMAL(10,2),
    [lineitemRequiresShipping] BIT,
    [lineitemTaxable] BIT,
    [lineitemFulfillmentStatus] NVARCHAR(255),
    [billingStreet] NVARCHAR(255),
    [billingAddress2] NVARCHAR(255),
    [billingCompany] NVARCHAR(255),
    [billingProvince] NVARCHAR(255),
    [billingCountry] NVARCHAR(255),
    [shippingName] NVARCHAR(255),
    [shippingStreet] NVARCHAR(255),
    [shippingAddress1] NVARCHAR(255),
    [shippingAddress2] NVARCHAR(255),
    [shippingCompany] NVARCHAR(255),
    [shippingCity] NVARCHAR(255),
    [shippingZip] NVARCHAR(255),
    [shippingProvince] NVARCHAR(255),
    [shippingCountry] NVARCHAR(255),
    [shippingPhone] NVARCHAR(255),
    [notes] NVARCHAR(255),
    [noteAttributes] TEXT,
    [cancelledAt] DATETIME2,
    [paymentMethod] NVARCHAR(255),
    [paymentReference] NVARCHAR(255),
    [refundedAmount] DECIMAL(10,2),
    [outstandingBalance] DECIMAL(10,2),
    [employee] NVARCHAR(255),
    [location] NVARCHAR(255),
    [deviceId] NVARCHAR(255),
    [tags] NVARCHAR(255),
    [riskLevel] NVARCHAR(255),
    [source] NVARCHAR(255),
    [lineitemDiscount] DECIMAL(10,2),
    [tax1Name] NVARCHAR(255),
    [tax1Value] NVARCHAR(255),
    [tax2Name] NVARCHAR(255),
    [tax2Value] NVARCHAR(255),
    [tax3Name] NVARCHAR(255),
    [tax3Value] NVARCHAR(255),
    [tax4Name] NVARCHAR(255),
    [tax4Value] NVARCHAR(255),
    [tax5Name] NVARCHAR(255),
    [tax5Value] NVARCHAR(255),
    [phone] NVARCHAR(255),
    [receiptNumber] NVARCHAR(255),
    [duties] NVARCHAR(255),
    [billingProvinceName] NVARCHAR(255),
    [shippingProvinceName] NVARCHAR(255),
    [paymentId] NVARCHAR(255),
    [paymentTermsName] NVARCHAR(255),
    [nextPaymentDueAt] DATETIME2,
    [paymentReferences] NVARCHAR(255),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ShopifyOrder_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ShopifyOrder_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ShopifyOrder_purchaseOrder_name_materialProductCode_key] UNIQUE NONCLUSTERED ([purchaseOrder],[name],[materialProductCode])
);

-- CreateTable
CREATE TABLE [dbo].[ExportHistories] (
    [id] INT NOT NULL IDENTITY(1,1),
    [transactions] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExportHistories_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT,
    CONSTRAINT [ExportHistories_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[VatRates] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rate] DECIMAL(5,2) NOT NULL,
    [country] NVARCHAR(5) NOT NULL,
    [description] NVARCHAR(255),
    [status] NVARCHAR(10) NOT NULL CONSTRAINT [VatRates_status_df] DEFAULT 'ACTIVE',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [VatRates_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [VatRates_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [VatRates_country_key] UNIQUE NONCLUSTERED ([country])
);

-- AddForeignKey
ALTER TABLE [dbo].[Profile] ADD CONSTRAINT [Profile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DeviceInformation] ADD CONSTRAINT [DeviceInformation_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FileUpload] ADD CONSTRAINT [FileUpload_salesPlatformId_fkey] FOREIGN KEY ([salesPlatformId]) REFERENCES [dbo].[SalesPlatform]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FileUpload] ADD CONSTRAINT [FileUpload_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[OrderTransactions] ADD CONSTRAINT [OrderTransactions_salesPlatformId_fkey] FOREIGN KEY ([salesPlatformId]) REFERENCES [dbo].[SalesPlatform]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[OrderTransactions] ADD CONSTRAINT [OrderTransactions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ExportHistories] ADD CONSTRAINT [ExportHistories_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
