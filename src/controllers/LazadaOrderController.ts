import { throwError } from '@/libs/ErrorService'
import { processExtractAndAnalysisOrder, processExtractAndAnalysisShopifyOrder } from '@/controllers/ExtractFileController'
import { findFileUploadUnique } from '@/models/FileSystem'
import { iResponseFileUpload } from '@/interfaces/FileSystem'
import { Prisma } from '@prisma/client'
import { createOneOrderTransaction } from '@/models/OrderTransaction'
import { iContextParamsPagination } from '@/interfaces/Context'
import { createOneShopifyOrder } from '@/models/ShopifyOrder'
import { excelSerialDateToMoment } from '@/libs/Excel'
import { file } from 'bun'

export const coreProcessCreateLazadaOrder = async (fileDetail: iResponseFileUpload, userId: number): Promise<{ checker: boolean; message: string; data?: any[]; errors?: object }> => {
  try {
    console.log('** coreProcessCreateLazadaOrder')
    const { fileName, path, SalesPlatform } = fileDetail as iResponseFileUpload
    const excelFilePath: string = `${path}/${fileName}`
    if (SalesPlatform?.name !== 'SHOPIFY') return { checker: false, message: 'INVALID_FILE_TYPE', data: [] }
    console.log({ excelFilePath })
    const { data: shopifyOrder } = await processExtractAndAnalysisOrder(excelFilePath, 'shopify')
    const objectOrderTransaction: Prisma.OrderTransactionCreateInput = {
      User: {
        connect: {
          id: userId
        }
      }
    }
    const { data: shopifyOrderTransaction } = await createOneOrderTransaction(objectOrderTransaction)
    console.log({ shopifyOrderTransaction })
    const { id: shopifyOrderTransactionId } = shopifyOrderTransaction
    if (!shopifyOrder.length) return { checker: false, message: 'GET_DATA_NOT_FOUND', data: [] }
    const mappedShopifyOrders = shopifyOrder
      .filter(order => order.name && order.createdAt)
      .map(order => {
        const {
          name,
          email,
          financialStatus,
          paidAt,
          fulfillmentStatus,
          fulfilledAt,
          acceptsMarketing,
          currency,
          subtotal,
          shipping,
          taxes,
          total,
          discountCode,
          discountAmount,
          shippingMethod,
          createdAt,
          lineitemQuantity,
          lineitemName,
          lineitemPrice,
          lineitemCompareAtPrice,
          lineitemSku,
          lineitemRequiresShipping,
          lineitemTaxable,
          lineitemFulfillmentStatus,
          billingName,
          billingStreet,
          billingAddress1,
          billingAddress2,
          billingCompany,
          billingCity,
          billingZip,
          billingProvince,
          billingCountry,
          billingPhone,
          shippingName,
          shippingStreet,
          shippingAddress1,
          shippingAddress2,
          shippingCompany,
          shippingCity,
          shippingZip,
          shippingProvince,
          shippingCountry,
          shippingPhone,
          notes,
          noteAttributes,
          cancelledAt,
          paymentMethod,
          paymentReference,
          refundedAmount,
          vendor,
          outstandingBalance,
          employee,
          location,
          deviceId,
          id,
          tags,
          riskLevel,
          source,
          lineitemDiscount,
          tax1Name,
          tax1Value,
          tax2Name,
          tax2Value,
          tax3Name,
          tax3Value,
          tax4Name,
          tax4Value,
          tax5Name,
          tax5Value,
          phone,
          receiptNumber,
          duties,
          billingProvinceName,
          shippingProvinceName,
          paymentId,
          paymentTermsName,
          nextPaymentDueAt,
          paymentReferences
        } = order

        return {
          accountCode: 0,
          salesmanCode: 0,
          purchaseOrder: String(id),
          invoiceDate: paidAt ? excelSerialDateToMoment(paidAt).format() : null,
          name: billingName,
          address: billingAddress1,
          postCode: billingZip,
          city: billingCity,
          tel: billingPhone,
          taxId: 0,
          materialProductCode: lineitemSku,
          itemCat: vendor,
          quantity: lineitemQuantity,
          mg4: '-',
          profitCenter: '-',
          UOM: '-',
          plant: '-',
          storageLocation: '-',
          SORPrice: total,
          orderName: name,
          email,
          financialStatus,
          fulfillmentStatus,
          fulfilledAt: fulfilledAt ? excelSerialDateToMoment(fulfilledAt).format() : null,
          acceptsMarketing,
          currency,
          subtotal,
          shipping,
          taxes,
          discountCode,
          discountAmount,
          shippingMethod,
          orderCreatedAt: createdAt ? excelSerialDateToMoment(createdAt).format() : null,
          lineitemPrice,
          lineitemCompareAtPrice,
          lineitemName,
          lineitemRequiresShipping,
          lineitemTaxable,
          lineitemFulfillmentStatus,
          billingStreet,
          billingAddress2,
          billingCompany,
          billingProvince,
          billingCountry,
          shippingName,
          shippingStreet,
          shippingAddress1,
          shippingAddress2,
          shippingCompany,
          shippingCity,
          shippingZip,
          shippingProvince,
          shippingCountry,
          shippingPhone,
          notes,
          noteAttributes,
          cancelledAt: cancelledAt ? excelSerialDateToMoment(cancelledAt).format() : null,
          paymentMethod,
          paymentReference,
          refundedAmount,
          outstandingBalance,
          employee,
          location,
          deviceId,
          tags,
          riskLevel,
          source,
          lineitemDiscount,
          tax1Name,
          tax1Value,
          tax2Name,
          tax2Value,
          tax3Name,
          tax3Value,
          tax4Name,
          tax4Value,
          tax5Name,
          tax5Value,
          phone,
          receiptNumber,
          duties,
          billingProvinceName,
          shippingProvinceName,
          paymentId,
          paymentTermsName,
          nextPaymentDueAt: nextPaymentDueAt ? excelSerialDateToMoment(nextPaymentDueAt).format() : null,
          paymentReferences,
          OrderTransaction: { connect: { id: shopifyOrderTransactionId } }
        }
      })

    console.log({ mappedShopifyOrders: mappedShopifyOrders })
    // const { data: OrderTransaction } = await createOneShopifyOrder(mappedShopifyOrders[0])
    // console.log({ OrderTransaction })

    // const createdOrders = await Promise.all(
    //   mappedShopifyOrders.map(async order => {
    //     const { data } = await createOneShopifyOrder(order)
    //     return data
    //   })
    // )

    // console.log({ createdOrders })

    return { checker: true, message: 'POST_DATA_SUCCESS', data: [] }
  } catch (error) {
    console.log({ error })
    throw throwError(error, 'coreProcessCreateLazadaOrder')
  }
}

export const listsOrderLazadaTransactionsPagination = async (params: iContextParamsPagination) => {
  try {
    console.log({ params })
  } catch (error) {
    throw throwError(error, 'listsOrderLazadaTransactionsPagination')
  }
}
