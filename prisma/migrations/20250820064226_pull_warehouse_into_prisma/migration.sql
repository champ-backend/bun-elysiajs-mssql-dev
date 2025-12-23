BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Warehouses] (
    [id] INT NOT NULL IDENTITY(1,1),
    [material] NVARCHAR(255),
    [description] NVARCHAR(255),
    [plant] NVARCHAR(255),
    [storageLocation] NVARCHAR(255),
    [baseUnit] NVARCHAR(255),
    [unrestricted] FLOAT(53),
    [blocked] FLOAT(53),
    [createdAt] DATETIMEOFFSET NOT NULL,
    [updatedAt] DATETIMEOFFSET NOT NULL,
    CONSTRAINT [Warehouses_pkey] PRIMARY KEY CLUSTERED ([id])
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
