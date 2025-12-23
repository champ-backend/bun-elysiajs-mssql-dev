import { Context } from 'elysia'
import { z as bodySchema } from 'zod'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { extractMessagesAsync } from '@/libs/ExtractMessage'
import { iContactBodyOrderTransaction, iContextStore } from '@/interfaces/Context'
import { findFileUploadUnique } from '@/models/FileSystem'
import moment from 'moment'
import { findProductMasterUnique } from '@/models/ProductMaster'
import { findUserUnique } from '@/models/Users'

export const readFilesValidate =
  (data?: string[]) =>
  async ({ store, body, params }: Context) => {
    try {
      const { fileKey } = params
      const { language } = store as iContextStore

      const uuidSchema = bodySchema.object({
        fileKey: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(30, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(40, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z0-9]+$/, { message: 'INVALID_UUID' })
      })

      const validation = uuidSchema.safeParse({ fileKey })
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat({ errors: errorMessage[0] }, keyErrors[0], language)
      }
    } catch (error) {
      throw throwError(error, 'readFileValidate')
    }
  }

export const checkBodyOrderTransaction =
  (data?: string[]) =>
  async ({ store, body }: Context) => {
    try {
      const { language } = store as iContextStore
      const { fileKey } = body as iContactBodyOrderTransaction
      const orderTransactionSchema = bodySchema.object({
        fileKey: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(30, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(40, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z0-9-]+$/, { message: 'INVALID_UUID' })
      })

      const validation = orderTransactionSchema.safeParse({ fileKey })
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }
      const { data: findUniqueFileUpload } = await findFileUploadUnique({ fileKey: fileKey })
      console.log({ findUniqueFileUpload })
      if (!findUniqueFileUpload) return responseFormat({ fileKey: fileKey }, 'GET_DATA_NOT_FOUND', language)
      Object.assign(store, { fileUpload: findUniqueFileUpload })
    } catch (error) {
      throw throwError(error, 'checkBodyOrderTransaction')
    }
  }

export const checkParamsOrderTransaction =
  (data?: string[]) =>
  async ({ store, body, params }: Context) => {
    try {
      const { language } = store as iContextStore
      const { fileKey } = params
      const orderTransactionSchema = bodySchema.object({
        fileKey: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(30, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(40, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z0-9-]+$/, { message: 'INVALID_UUID' })
      })

      const validation = orderTransactionSchema.safeParse({ fileKey })
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }
      const { data: findUniqueFileUpload } = await findFileUploadUnique({ fileKey: fileKey })
      console.log({ findUniqueFileUpload })
      if (!findUniqueFileUpload) return responseFormat({ fileKey: fileKey }, 'GET_DATA_NOT_FOUND', language)
      Object.assign(store, { fileUpload: findUniqueFileUpload })
    } catch (error) {
      throw throwError(error, 'checkParamsOrderTransaction')
    }
  }

export const checkBodyShopee =
  (data?: string[]) =>
  async ({ store, body, set }: Context) => {
    try {
      const { language } = store as iContextStore
      const strictIsoDateSchema = bodySchema
        .string({ message: 'REQUIRED_ONLY_STRING' })
        .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
        .refine(value => moment(value, moment.ISO_8601, true).isValid(), { message: 'INVALID_DATE_FORMAT' })

      const shopeeBodySchema = bodySchema.object({
        accountCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        salesmanCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        purchaseOrder: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceDate: strictIsoDateSchema.optional(),
        name: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        address: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        postCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        city: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tel: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        taxId: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        materialProductCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        itemCat: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        quantity: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        mg4: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        profitCenter: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        UOM: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        plant: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        storageLocation: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        SORPrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        invoiceEmail: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        orderStatus: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        refundStatus: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        buyerName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        orderDate: strictIsoDateSchema.optional(),
        paymentMethod: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        paymentDetails: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        installmentPlan: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        transactionFeePercent: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingOption: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingMethod: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        trackingNumber: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        estimatedDeliveryDate: strictIsoDateSchema.optional(),
        deliveryTime: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        parentSku: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        productName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        optionName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        originalPrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        salePrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        returnedQuantity: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        netSalePrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        shopeeDiscount: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        sellerVoucher: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        coinsCashbackSeller: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        shopeeVoucher: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        discountCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        bundleDeal: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        bundleDiscountSeller: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        bundleDiscountShopee: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        coinsUsed: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        allPaymentPromotions: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        commissionFee: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        transactionFee: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        totalBuyerPaid: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        shippingFeeBuyer: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        shippingFeeShopee: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        returnShippingFee: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        serviceFee: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        estimatedShippingFee: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        receiverName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        buyerNote: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingCountry: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingDistrict: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        orderType: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        orderSuccessTime: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        orderNotes: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        buyerInvoiceRequest: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceType: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceBranchType: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceBranchName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceBranchCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceFullAddress: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceAddressDetails: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceSubDistrict: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceDistrict: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceProvince: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoicePostalCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        taxpayerId: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoicePhoneNumber: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        category: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        SOR_ApasNumber: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        codeSales: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceReceipt: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable()
      })

      const validation = shopeeBodySchema.safeParse(body)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        if (errors.invoiceDate?._errors?.length) return responseFormat({ error: `invoiceDate: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        if (errors.orderDate?._errors?.length) return responseFormat({ error: `orderDate: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        if (errors.estimatedDeliveryDate?._errors?.length) return responseFormat({ error: `estimatedDeliveryDate: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        set.status = 400
        return responseFormat(keyErrors, errorMessage[0], language)
      }
    } catch (error) {
      throw throwError(error, 'checkBodyShopee')
    }
  }

export const checkBodyShopify =
  (data?: string[]) =>
  async ({ store, body, set }: Context) => {
    try {
      const { language } = store as iContextStore
      const strictIsoDateSchema = bodySchema
        .string({ message: 'REQUIRED_ONLY_STRING' })
        .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
        .refine(value => moment(value, moment.ISO_8601, true).isValid(), { message: 'INVALID_DATE_FORMAT' })

      const shopifyBodySchema = bodySchema.object({
        accountCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        salesmanCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        purchaseOrder: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        invoiceDate: strictIsoDateSchema.optional(),
        name: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        address: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        postCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        city: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tel: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        taxId: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        materialProductCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        itemCat: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        quantity: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        mg4: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        profitCenter: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        UOM: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        plant: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        storageLocation: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        SORPrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        orderName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        email: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        financialStatus: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        fulfillmentStatus: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        fulfilledAt: strictIsoDateSchema.optional(),
        acceptsMarketing: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        currency: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        subtotal: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        shipping: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        taxes: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        discountCode: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        discountAmount: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        shippingMethod: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        orderCreatedAt: strictIsoDateSchema.optional(),
        lineitemPrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        lineitemCompareAtPrice: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        lineitemName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        lineitemRequiresShipping: bodySchema.boolean({ message: 'REQUIRED_ONLY_BOOLEAN' }).optional().nullable(),
        lineitemTaxable: bodySchema.boolean({ message: 'REQUIRED_ONLY_BOOLEAN' }).optional().nullable(),
        lineitemFulfillmentStatus: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        billingStreet: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        billingAddress2: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        billingCompany: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        billingProvince: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        billingCountry: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingStreet: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingAddress1: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingAddress2: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingCompany: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingCity: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingZip: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingProvince: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingCountry: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingPhone: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        notes: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        noteAttributes: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        cancelledAt: strictIsoDateSchema.optional(),
        paymentMethod: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        paymentReference: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        refundedAmount: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        outstandingBalance: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        employee: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        location: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        deviceId: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tags: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        riskLevel: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        source: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        lineitemDiscount: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        tax1Name: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax1Value: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax2Name: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax2Value: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax3Name: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax3Value: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax4Name: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax4Value: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax5Name: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        tax5Value: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        phone: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        receiptNumber: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        duties: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        billingProvinceName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        shippingProvinceName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        paymentId: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        paymentTermsName: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        nextPaymentDueAt: strictIsoDateSchema.optional(),
        paymentReferences: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable()
      })

      const validation = shopifyBodySchema.safeParse(body)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        if (errors.fulfilledAt?._errors?.length) return responseFormat({ error: `fulfilledAt: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        if (errors.invoiceDate?._errors?.length) return responseFormat({ error: `invoiceDate: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        if (errors.orderCreatedAt?._errors?.length) return responseFormat({ error: `orderCreatedAt: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        if (errors.cancelledAt?._errors?.length) return responseFormat({ error: `cancelledAt: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        if (errors.nextPaymentDueAt?._errors?.length) return responseFormat({ error: `nextPaymentDueAt: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        set.status = 400
        return responseFormat(keyErrors, errorMessage[0], language)
      }
    } catch (error) {
      throw throwError(error, 'checkBodyShopify')
    }
  }

export const checkBodyOrderTransactionCreate =
  () =>
  async ({ store, body, set }: Context) => {
    try {
      const { language } = store as iContextStore
      const shopeeBodySchema = bodySchema.object({
        accountCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        salesmanCode: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' }).optional().nullable(),
        plant: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable(),
        storageLocation: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .regex(/^[\u0E00-\u0E7Fa-zA-Z0-9-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' })
          .optional()
          .nullable()
      })

      const validation = shopeeBodySchema.safeParse(body)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        set.status = 400
        return responseFormat(keyErrors, errorMessage[0], language)
      }
    } catch (error) {
      throw throwError(error, 'checkBodyOrderTransactionCreate')
    }
  }

export const checkParamsProductMasterUpdate =
  (data?: string[]) =>
  async ({ store, body, params, set }: Context) => {
    try {
      const { language } = store as iContextStore
      const checkParamsProductMaster = bodySchema.object({
        id: bodySchema.coerce.number({ message: 'REQUIRED_ONLY_NUMBER' })
      })

      const validation = checkParamsProductMaster.safeParse(params)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        set.status = 400
        return responseFormat(keyErrors, errorMessage.join(', ') || 'INVALID_PARAMS', language)
      }

      const { id } = validation.data
      const { data: productMaster } = await findProductMasterUnique({ id })
      console.log({ productMaster })

      if (!productMaster) return responseFormat({ id }, 'GET_DATA_NOT_FOUND', language)
      Object.assign(store, { updateId: id })
    } catch (error) {
      throw throwError(error, 'checkParamsOrderTransactionUpdate')
    }
  }

export const checkQueryUserIdOrderTransaction =
  (data?: string[]) =>
  async ({ store, body, query }: Context) => {
    try {
      const { language } = store as iContextStore
      const { userId } = query
      const orderTransactionSchema = bodySchema.object({
        userId: bodySchema.number({ message: 'REQUIRED_ONLY_NUMBER' })
      })

      const validation = orderTransactionSchema.safeParse({ userId })
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }
      const { data: findUserById } = await findUserUnique({ id: +userId })
      console.log({ findUserById })
      if (!findUserById) return responseFormat({ userId }, 'GET_DATA_NOT_FOUND', language)
      Object.assign(store, { body: findUserById })
    } catch (error) {
      throw throwError(error, 'checkQueryUserIdOrderTransaction')
    }
  }
