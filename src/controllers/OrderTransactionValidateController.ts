import { z as bodySchema } from 'zod'
import { extractMessagesAsync } from '@/libs/ExtractMessage'
import moment from 'moment'
import { throwError } from '@/libs/ErrorService'
import { findProductMasterUnique } from '@/models/ProductMaster'
import { findAllWarehouse } from '@/models/Warehouse'
import { matchesStockWhere } from '@/libs/OrderTransactions'
import { findWhereAndGroupOrderTransactions } from '@/models/OrderTransaction'
import { OrderTransactionRoutes } from '@/routes/OrderTransaction'
import { createDateAndTimeObject } from '@/libs/DateTimeWithMoment'
import { iQueryOrderTransaction } from '@/interfaces/OrderTransaction'

export const orderTransactionValidate = async (
  dataOrders: any
): Promise<{
  checker: boolean
  message: string
  errors: any[]
}> => {
  try {
    const dataErrors: any[] = []
    for (let index = 0; index < dataOrders.length; index++) {
      // console.log(`=======>>>>  Validating order at index ${index}:`, dataOrders[index])
      //taxId,profitCenter, mg4,address2,requireTaxInvoice-> optional
      const { accountCode, salesmanCode, purchaseOrder, invoiceDate, name, address, address2, postCode, city, tel, requireTaxInvoice, itemCat, taxId, materialProductCode, quantity, mg4, profitCenter, UOM, plant, storageLocation, SORPrice } =
        dataOrders[index]
      const strictIsoDateSchema = bodySchema
        .string({ message: 'REQUIRED_ONLY_STRING' })
        .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
        .refine(value => moment(value, moment.ISO_8601, true).isValid(), { message: 'INVALID_DATE_FORMAT' })
      const shopifyBodySchema = bodySchema.object({
        accountCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }),
        salesmanCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }),
        purchaseOrder: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9- ]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        invoiceDate: strictIsoDateSchema,
        name: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).min(1, { message: 'MISSING_REQUIRED_VALUES' }),
        // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9\-\/\.@#\(\), \r\n]*$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        address: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).min(1, { message: 'MISSING_REQUIRED_VALUES' }),
        // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9\-\/\.@#\(\), \r\n]*$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        address2: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9\-\/\.@#\(\), \r\n]*$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .nullable(),
        postCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .min(1, { message: 'MISSING_REQUIRED_VALUES' })
          .regex(/^[\d-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        city: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).min(1, { message: 'MISSING_REQUIRED_VALUES' }),
        // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9- ]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        tel: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .min(1, { message: 'MISSING_REQUIRED_VALUES' })
          // .regex(/^[\d-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        taxId: bodySchema.coerce
          .string()
          .regex(/^\d{13}$/, {
            message: 'REQUIRED_ONLY_NUMBER'
          })
          .transform(val => {
            return val === '' ? null : Number(val)
          })
          .optional()
          .nullable(),
        materialProductCode: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9- ]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        itemCat: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9- ]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        quantity: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }),
        mg4: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9- ]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        profitCenter: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9- ]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        UOM: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        // .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9- ]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        plant: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        // .regex(/^[a-zA-Z0-9]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        storageLocation: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        // .regex(/^[a-zA-Z0-9]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        SORPrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }),
        requireTaxInvoice: bodySchema.boolean({ message: 'REQUIRED_ONLY_BOOLEAN' }).optional().nullable()
      })

      const validation = shopifyBodySchema.safeParse({
        accountCode,
        salesmanCode,
        purchaseOrder,
        invoiceDate,
        name,
        address,
        address2,
        postCode,
        city,
        tel,
        requireTaxInvoice,
        itemCat,
        taxId,
        materialProductCode,
        quantity,
        mg4,
        profitCenter,
        UOM,
        plant,
        storageLocation,
        SORPrice
      })

      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        console.log({ errors: JSON.stringify(errors), keyErrors, errorMessage })
        const errorOutput: Record<string, string> = Object.entries(errors)
          .filter(([key]) => key !== '_errors')
          .reduce((acc, [key, value]: [string, any]) => {
            if (Array.isArray(value._errors) && value._errors.length > 0) {
              acc[key] = value._errors[0]
            }
            return acc
          }, {} as Record<string, string>)

        dataErrors.push({
          accountCode,
          salesmanCode,
          purchaseOrder,
          invoiceDate,
          name,
          address,
          address2,
          postCode,
          city,
          tel,
          requireTaxInvoice,
          itemCat,
          taxId,
          materialProductCode,
          quantity,
          mg4,
          profitCenter,
          UOM,
          plant,
          storageLocation,
          SORPrice,
          keyErrors: errorOutput
        })
      }
    }
    console.log('Validation completed with errors:', dataErrors)
    return dataErrors.length > 0 ? { checker: false, message: 'Invalid order data', errors: dataErrors } : { checker: true, message: 'All orders are valid', errors: [] }
  } catch (error) {
    console.log('Error in orderTransactionValidate:', error)
    throw throwError(error, 'orderTransactionValidate')
  }
}

export const materialProductCodeValidate = async (dataOrders: any) => {
  try {
    const dataErrors: any[] = []
    for (let index = 0; index < dataOrders.length; index++) {
      const { accountCode, salesmanCode, purchaseOrder, invoiceDate, name, address, address2, postCode, city, tel, requireTaxInvoice, itemCat, taxId, materialProductCode, quantity, mg4, profitCenter, UOM, plant, storageLocation, SORPrice } =
        dataOrders[index]
      const { data: productMaster } = await findProductMasterUnique({ material: materialProductCode })
      if (!productMaster)
        dataErrors.push({
          accountCode,
          salesmanCode,
          purchaseOrder,
          invoiceDate,
          name,
          address,
          address2,
          postCode,
          city,
          tel,
          requireTaxInvoice,
          itemCat,
          taxId,
          materialProductCode,
          quantity,
          mg4,
          profitCenter,
          UOM,
          plant,
          storageLocation,
          SORPrice,
          keyErrors: {
            materialProductCode: 'MATERIAL_PRODUCT_CODE_NOT_FOUND'
          }
        })
    }
    console.log('Material product code validation completed with errors:', dataErrors)
    return dataErrors.length > 0 ? { checker: false, message: 'Invalid order data', errors: dataErrors } : { checker: true, message: 'All orders are valid', errors: [] }
  } catch (error) {
    throw throwError(error, 'materialProductCodeValidate')
  }
}

export const productInStockValidate = async (params?: any, query?: object) => {
  try {
    const { searchStart, searchEnd, typePlatform } = query as iQueryOrderTransaction
    const [{ where: whereDateAndTime }, allStock] = await Promise.all([createDateAndTimeObject(searchStart, searchEnd, 'invoiceDate'), findAllWarehouse({})])
    const where = { ...whereDateAndTime, ...(typePlatform && { SalesPlatform: { name: { contains: typePlatform } } }) }
    const orderTransactionData = (await findWhereAndGroupOrderTransactions(where)) || {}
    const details: any = []
    if (!allStock.length) return { data: [] }
    for (let index = 0; index < orderTransactionData.length; index++) {
      const { materialProductCode, plant, storageLocation, _sum } = orderTransactionData[index]
      const quantity = _sum.quantity || 0
      const query = { material: materialProductCode, plant, storageLocation }
      const matchedItem = allStock.find(item => matchesStockWhere(item, query))
      if (!matchedItem) continue
      const { id, unrestricted, createdAt, updatedAt, ...resData } = matchedItem as any
      details.push({
        ...resData,
        unrestricted,
        quantity,
        hasInsufficientStock: quantity <= unrestricted ? false : true
      })
    }

    return { data: details }
  } catch (error) {
    throw throwError(error, 'productInStockValidate')
  }
}

export const orderTransactionTiktokValidate = async (
  dataOrders: any
): Promise<{
  checker: boolean
  message: string
  errors: any[]
}> => {
  try {
    const dataErrors: any[] = []
    for (let index = 0; index < dataOrders.length; index++) {
      const { accountCode, salesmanCode, purchaseOrder, invoiceDate, name, address, address2, postCode, city, tel, requireTaxInvoice, itemCat, taxId, materialProductCode, quantity, mg4, profitCenter, UOM, plant, storageLocation, SORPrice } =
        dataOrders[index]
      const strictIsoDateSchema = bodySchema
        .string({ message: 'REQUIRED_ONLY_STRING' })
        .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
        .refine(value => moment(value, moment.ISO_8601, true).isValid(), { message: 'INVALID_DATE_FORMAT' })
      const shopifyBodySchema = bodySchema.object({
        accountCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }),
        salesmanCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }),
        purchaseOrder: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        invoiceDate: strictIsoDateSchema,
        name: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).min(1, { message: 'MISSING_REQUIRED_VALUES' }),
        address: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).min(1, { message: 'MISSING_REQUIRED_VALUES' }),
        address2: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).nullable(),
        postCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .min(1, { message: 'MISSING_REQUIRED_VALUES' })
          .regex(/^[\d*-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        city: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).min(1, { message: 'MISSING_REQUIRED_VALUES' }),
        tel: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).min(1, { message: 'MISSING_REQUIRED_VALUES' }).optional().nullable(),
        taxId: bodySchema.coerce
          .string()
          .regex(/^\d{13}$/, {
            message: 'REQUIRED_ONLY_NUMBER'
          })
          .transform(val => {
            return val === '' ? null : Number(val)
          })
          .optional()
          .nullable(),
        materialProductCode: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        itemCat: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        quantity: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }),
        mg4: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).optional().nullable(),
        profitCenter: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).optional().nullable(),
        UOM: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        plant: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        storageLocation: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
        SORPrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }),
        requireTaxInvoice: bodySchema.boolean({ message: 'REQUIRED_ONLY_BOOLEAN' }).optional().nullable()
      })

      const validation = shopifyBodySchema.safeParse({
        accountCode,
        salesmanCode,
        purchaseOrder,
        invoiceDate,
        name,
        address,
        address2,
        postCode,
        city,
        tel,
        requireTaxInvoice,
        itemCat,
        taxId,
        materialProductCode,
        quantity,
        mg4,
        profitCenter,
        UOM,
        plant,
        storageLocation,
        SORPrice
      })

      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        console.log({ errors: JSON.stringify(errors), keyErrors, errorMessage })
        const errorOutput: Record<string, string> = Object.entries(errors)
          .filter(([key]) => key !== '_errors')
          .reduce((acc, [key, value]: [string, any]) => {
            if (Array.isArray(value._errors) && value._errors.length > 0) {
              acc[key] = value._errors[0]
            }
            return acc
          }, {} as Record<string, string>)

        dataErrors.push({
          accountCode,
          salesmanCode,
          purchaseOrder,
          invoiceDate,
          name,
          address,
          address2,
          postCode,
          city,
          tel,
          requireTaxInvoice,
          itemCat,
          taxId,
          materialProductCode,
          quantity,
          mg4,
          profitCenter,
          UOM,
          plant,
          storageLocation,
          SORPrice,
          keyErrors: errorOutput
        })
      }
    }
    console.log('Validation completed with errors:', dataErrors)
    return dataErrors.length > 0 ? { checker: false, message: 'Invalid order data', errors: dataErrors } : { checker: true, message: 'All orders are valid', errors: [] }
  } catch (error) {
    console.log('Error in orderTransactionTiktokValidate:', error)
    throw throwError(error, 'orderTransactionTiktokValidate')
  }
}
