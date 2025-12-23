import { throwError } from '@/libs/ErrorService'
import ExcelExtractorTransformer from './ExtractAndTranformerController'
import config from 'config'
import { iFileLocations } from '@/interfaces/Config'
import { iHeaderMapType, iResponseFileUpload } from '@/interfaces/FileSystem'
import { log } from 'console'
import { findUniqueVatRatesWhere } from '@/models/VatRates'
import { Prisma } from '@prisma/client'
import { dynamicProcessExtractAndAnalysisOrder, processExtractAndAnalysisOrder } from './ExtractFileController'
import { findProductMasterUnique } from '@/models/ProductMaster'
import { iResultShopifyItem, iResultTiktokItem } from '@/interfaces/OrderTransaction'
import { splitAddressChannalTiktok, splitAddressWithInvoiceSubDistrict, splitAddressWithShippingAddress, splitNameAndCheckInvoiceTypeShopee, splitNameChannalTiktok } from '@/libs/Address'
import { materialProductCodeValidate, orderTransactionTiktokValidate, orderTransactionValidate } from './OrderTransactionValidateController'
import { formatDateForMSSQL } from '@/libs/DateTimeWithMoment'
import { extractVat } from '@/libs/OrderTransactions'
import { checkDuplicateOrdersTiktokInDB, upsertTiktokOrderUnique } from '@/models/TiktokOrder'
import { upsertOrderTransactionsUnique } from '@/models/OrderTransaction'

const fileLocaltion = config.get<iFileLocations>('fileLocation')
export const coreProcessCreateTiktokOrder = async (params?: any) => {
  try {
    const filePath = fileLocaltion.tiktok
    const sheetIndex = 1
    const keyCase = 'camelCase'
    const tiktokOrders = new ExcelExtractorTransformer(filePath, sheetIndex, keyCase)
    const loadData = await tiktokOrders.RunLoadExcelFile()
    const headerMap: iHeaderMapType = {
      'Order ID': { keyName: 'orderId', type: 'string' },
      'Order Status': { keyName: 'orderStatus', type: 'string' },
      'Order Substatus': { keyName: 'orderSubstatus', type: 'string' },
      'Cancelation/Return Type': { keyName: 'cancelationReturnType', type: 'string' },
      'Normal or Pre-order': { keyName: 'normalOrPreOrder', type: 'string' },
      'SKU ID': { keyName: 'skuId', type: 'string' },
      'Seller SKU': { keyName: 'sellerSku', type: 'number' },
      'Product Name': { keyName: 'productName', type: 'string' },
      Variation: { keyName: 'variation', type: 'string' },
      Quantity: { keyName: 'quantity', type: 'number' },
      'Sku Quantity of return': { keyName: 'skuQuantityOfReturn', type: 'number' },
      'SKU Unit Original Price': { keyName: 'skuUnitOriginalPrice', type: 'number' },
      'SKU Subtotal Before Discount': { keyName: 'skuSubtotalBeforeDiscount', type: 'number' },
      'SKU Platform Discount': { keyName: 'skuPlatformDiscount', type: 'number' },
      'SKU Seller Discount': { keyName: 'skuSellerDiscount', type: 'number' },
      'SKU Subtotal After Discount': { keyName: 'skuSubtotalAfterDiscount', type: 'number' },
      'Shipping Fee After Discount': { keyName: 'shippingFeeAfterDiscount', type: 'number' },
      'Original Shipping Fee': { keyName: 'originalShippingFee', type: 'number' },
      'Shipping Fee Seller Discount': { keyName: 'shippingFeeSellerDiscount', type: 'number' },
      'Shipping Fee Platform Discount': { keyName: 'shippingFeePlatformDiscount', type: 'number' },
      Taxes: { keyName: 'taxes', type: 'number' },
      'Small Order Fee': { keyName: 'smallOrderFee', type: 'number' },
      'Order Amount': { keyName: 'orderAmount', type: 'number' },
      'Order Refund Amount': { keyName: 'orderRefundAmount', type: 'number' },
      'Created Time': { keyName: 'createdTime', type: 'string' },
      'Paid Time': { keyName: 'paidTime', type: 'string' },
      'RTS Time': { keyName: 'rtsTime', type: 'string' },
      'Shipped Time': { keyName: 'shippedTime', type: 'string' },
      'Delivered Time': { keyName: 'deliveredTime', type: 'string' },
      'Cancelled Time': { keyName: 'cancelledTime', type: 'string' },
      'Cancel By': { keyName: 'cancelBy', type: 'string' },
      'Cancel Reason': { keyName: 'cancelReason', type: 'string' },
      'Fulfillment Type': { keyName: 'fulfillmentType', type: 'string' },
      'Warehouse Name': { keyName: 'warehouseName', type: 'string' },
      'Tracking ID': { keyName: 'trackingId', type: 'string' },
      'Delivery Option': { keyName: 'deliveryOption', type: 'string' },
      'Shipping Provider Name': { keyName: 'shippingProviderName', type: 'string' },
      'Buyer Message': { keyName: 'buyerMessage', type: 'string' },
      'Buyer Username': { keyName: 'buyerUsername', type: 'string' },
      Recipient: { keyName: 'recipient', type: 'string' },
      'Phone #': { keyName: 'phone', type: 'string' },
      Zipcode: { keyName: 'zipcode', type: 'string' },
      Country: { keyName: 'country', type: 'string' },
      Province: { keyName: 'province', type: 'string' },
      District: { keyName: 'district', type: 'string' },
      'Detail Address': { keyName: 'detailAddress', type: 'string' },
      'Additional address information': { keyName: 'additionalAddressInformation', type: 'string' },
      'Payment Method': { keyName: 'paymentMethod', type: 'string' },
      'Weight(kg)': { keyName: 'weight', type: 'number' },
      'Product Category': { keyName: 'productCategory', type: 'string' },
      'Package ID': { keyName: 'packageId', type: 'string' },
      'Seller Note': { keyName: 'sellerNote', type: 'string' },
      'Checked Status': { keyName: 'checkedStatus', type: 'string' },
      'Checked Marked by': { keyName: 'checkedMarkedBy', type: 'string' }
    }
    const resultTiktokOrder = await tiktokOrders.RunMapDataTransform(loadData.rawDataSheet, headerMap)
    // console.log({ resultTiktokOrder })
  } catch (error) {
    throw throwError(error, 'coreProcessCreateTiktokOrder')
  }
}

export const coreProcessCreateTiktokOrderMiddleware = async (fileDetail: iResponseFileUpload, userId: number, objectBody?: any): Promise<{ checker: boolean; message: string; data?: any[]; errors?: object }> => {
  try {
    const { accountCode = 9155000390, salesmanCode = 115, plant = 'ZT40', storageLocation = 'ZT45', country = 'TH' } = objectBody
    const { fileName, path, SalesPlatform, type } = fileDetail as iResponseFileUpload
    if (SalesPlatform?.name !== 'TIKTOK') return { checker: false, message: 'INVALID_FILE_TYPE', data: [] }
    const excelFilePath: string = `${path}/${fileName}`
    const [{ data: tiktokOrders }, { data: vatRateByCountryData }] = await Promise.all([dynamicProcessExtractAndAnalysisOrder(excelFilePath, 'tiktok', type), findUniqueVatRatesWhere({ country })])
    if (!vatRateByCountryData) return { checker: false, message: 'INVALID_VAT_RATE', data: [] }
    const { rate } = vatRateByCountryData as { rate: Prisma.Decimal }
    const dataTiktokOrders = await Promise.all(
      tiktokOrders
        .filter(order => order.orderStatus !== 'Cancelled')
        .map(async order => {
          const {
            orderId,
            orderStatus,
            orderSubstatus,
            cancelationReturnType,
            normalOrPreOrder,
            skuId,
            sellerSku,
            productName,
            variation,
            quantity,
            skuQuantityOfReturn,
            skuUnitOriginalPrice,
            skuSubtotalBeforeDiscount,
            skuPlatformDiscount,
            skuSellerDiscount,
            skuSubtotalAfterDiscount,
            shippingFeeAfterDiscount,
            originalShippingFee,
            shippingFeeSellerDiscount,
            shippingFeePlatformDiscount,
            taxes,
            smallOrderFee,
            orderAmount,
            orderRefundAmount,
            createdTime,
            paidTime,
            rtsTime,
            shippedTime,
            deliveredTime,
            cancelledTime,
            cancelBy,
            cancelReason,
            fulfillmentType,
            warehouseName,
            trackingId,
            deliveryOption,
            shippingProviderName,
            buyerMessage,
            buyerUsername,
            recipient,
            phone,
            zipcode,
            country: tiktokCountry,
            province,
            district,
            detailAddress,
            additionalAddressInformation,
            paymentMethod,
            weight,
            productCategory,
            packageId,
            sellerNote,
            checkedStatus,
            checkedMarkedBy,
            profitCenter
          } = order

          let address: string = ''
          let address2: string = ''
          let addressShiping: string = ''
          let addressShiping2: string = ''
          let invoiceName1: string = ''
          let invoiceName2: string = ''
          let buyerName1: string = ''
          let buyerName2: string = ''

          // const result = await splitAddressChannalTiktok(detailAddress)
          // console.log({ result })
          // addressShiping = result.address
          // addressShiping2 = result.address2

          const { name1, name2 } = await splitNameChannalTiktok(recipient)
          buyerName1 = name1
          buyerName2 = name2

          const { data: productMasterData } = await findProductMasterUnique({ material: sellerSku ? String(sellerSku) : '' })
          return {
            accountCode: accountCode ? accountCode : 9155000390,
            salesmanCode: salesmanCode ? salesmanCode : 115,
            purchaseOrder: orderId,
            invoiceDate: paidTime ? formatDateForMSSQL(paidTime) : new Date().toISOString(),
            name: buyerName1,
            name2: buyerName2,
            address: detailAddress,
            address2: null,
            address3: additionalAddressInformation,
            postCode: zipcode,
            city: province,
            tel: phone,
            requireTaxInvoice: false,
            taxId: null,
            materialProductCode: sellerSku ? String(sellerSku) : '',
            quantity,
            itemCat: skuSubtotalAfterDiscount != 0 ? 'TAN' : 'ZFRC',
            mg4: skuSubtotalAfterDiscount != 0 ? null : 'ZZZ',
            profitCenter,
            UOM: productMasterData?.baseUnit || '',
            plant: plant ? plant : 'ZT40',
            storageLocation: storageLocation ? storageLocation : 'ZT45',
            SORPrice: skuSubtotalAfterDiscount,
            orderStatus,
            orderSubStatus: orderSubstatus,
            cancelationReturnType,
            normalOrPreOrder,
            skuId,
            productName,
            variation,
            skuQuantityOfReturn,
            skuUnitOriginalPrice,
            skuSubtotalBeforeDiscount,
            skuPlatformDiscount,
            skuSellerDiscount,
            shippingFeeAfterDiscount,
            originalShippingFee,
            shippingFeeSellerDiscount,
            shippingFeePlatformDiscount,
            taxes: Number(taxes),
            smallOrderFee,
            orderAmount,
            orderRefundAmount,
            createdTime: createdTime ? formatDateForMSSQL(createdTime) : null,
            rtsTime: rtsTime ? formatDateForMSSQL(rtsTime) : null,
            shippedTime: shippedTime ? formatDateForMSSQL(shippedTime) : null,
            deliveredTime: deliveredTime ? formatDateForMSSQL(deliveredTime) : null,
            cancelledTime: cancelledTime ? formatDateForMSSQL(cancelledTime) : null,
            cancelBy,
            cancelReason,
            fulfillmentType,
            warehouseName,
            trackingId,
            deliveryOption,
            shippingProviderName,
            buyerMessage,
            buyerUsername,
            country,
            district,
            paymentMethod,
            weight,
            productCategory,
            packageId,
            sellerNote,
            checkedStatus,
            checkedMarkedBy
          }
        })
    )

    const { checker: checkerTiktok, message: messageTiktok, errors: dataTiktok } = (await orderTransactionTiktokValidate(dataTiktokOrders)) as { checker: boolean; message: string; errors: any[] }
    if (!checkerTiktok) return { checker: checkerTiktok, message: 'POST_DATA_FAILED', data: dataTiktok || [] }
    const { checker: checkerProductMaster, message: messageProductMaster, errors: dataProductMaster } = await materialProductCodeValidate(dataTiktokOrders)
    if (!checkerProductMaster) return { checker: checkerProductMaster, message: 'POST_DATA_FAILED', data: dataProductMaster || [] }
    const createdTiktokOrders = []
    const createdOrderTransactions = []
    for (let index = 0; index < dataTiktokOrders.length; index++) {
      const {
        accountCode,
        salesmanCode,
        purchaseOrder,
        invoiceDate,
        name,
        name2,
        address,
        address2,
        address3,
        postCode,
        city,
        tel,
        requireTaxInvoice,
        taxId,
        materialProductCode,
        itemCat,
        quantity,
        mg4,
        profitCenter,
        UOM,
        plant,
        storageLocation,
        SORPrice
      } = dataTiktokOrders[index]

      const SORPriceExVat = extractVat(SORPrice / quantity, rate.toNumber())
      const whereUnique = { purchaseOrder, name, materialProductCode, SORPrice: SORPriceExVat.priceExVat }
      const objectOrderTransaction: Prisma.OrderTransactionsCreateInput = {
        User: {
          connect: {
            id: userId
          }
        },
        SalesPlatform: {
          connect: {
            id: SalesPlatform.id
          }
        },
        accountCode,
        salesmanCode,
        purchaseOrder,
        invoiceDate,
        name,
        name2,
        address,
        address2,
        address3,
        postCode,
        city,
        country,
        tel,
        requireTaxInvoice,
        taxId,
        materialProductCode,
        itemCat,
        quantity,
        mg4,
        profitCenter,
        UOM,
        plant,
        storageLocation,
        SORPrice: SORPriceExVat.priceExVat,
        totalPrice: SORPrice
      }
      dataTiktokOrders[index].SORPrice = SORPriceExVat.priceExVat
      const [{ data: createdTiktokOrder }, { data: createdOrderTransaction }] = await Promise.all([
        upsertTiktokOrderUnique({ uniqueTiktokOrder: { ...whereUnique } }, { ...dataTiktokOrders[index] }, dataTiktokOrders[index]),
        upsertOrderTransactionsUnique({ uniqueOrderTransaction: { ...whereUnique } }, objectOrderTransaction, objectOrderTransaction)
      ])
      createdTiktokOrders.push(createdTiktokOrder)
      createdOrderTransactions.push(createdOrderTransaction)
      console.log({ createdTiktokOrders, createdOrderTransactions })
    }

    return { checker: true, message: 'POST_DATA_SUCCESS', data: createdOrderTransactions || [], errors: {} }
  } catch (error) {
    throw throwError(error, 'coreProcessCreateShopeeOrder')
  }
}

export async function computeResultItemsOrderTiktok(data: any): Promise<iResultTiktokItem[]> {
  try {
    const orderMap = new Map<string, iResultTiktokItem[]>()
    for (const item of data) {
      if (!orderMap.has(item.orderId)) orderMap.set(item.orderId, [])
      orderMap.get(item.orderId)!.push(item)
    }
    const result: iResultTiktokItem[] = []
    for (const [name, items] of orderMap) {
      for (let index = 0; index < items.length; ++index) {
        const {
          orderId,
          orderStatus,
          orderSubstatus,
          cancelationReturnType,
          normalOrPreOrder,
          skuId,
          sellerSku,
          productName,
          variation,
          quantity,
          skuQuantityOfReturn,
          skuUnitOriginalPrice,
          skuSubtotalBeforeDiscount,
          skuPlatformDiscount,
          skuSellerDiscount,
          skuSubtotalAfterDiscount,
          shippingFeeAfterDiscount,
          originalShippingFee,
          shippingFeeSellerDiscount,
          shippingFeePlatformDiscount,
          taxes,
          smallOrderFee,
          orderAmount,
          orderRefundAmount,
          createdTime,
          paidTime,
          rtsTime,
          shippedTime,
          deliveredTime,
          cancelledTime,
          cancelBy,
          cancelReason,
          fulfillmentType,
          warehouseName,
          trackingId,
          deliveryOption,
          shippingProviderName,
          buyerMessage,
          buyerUsername,
          recipient,
          phone,
          zipcode,
          country,
          province,
          district,
          detailAddress,
          additionalAddressInformation,
          paymentMethod,
          weight,
          productCategory,
          packageId,
          sellerNote,
          checkedStatus,
          checkedMarkedBy
        } = items[0]
        const { data: productMasterData } = await findProductMasterUnique({ material: sellerSku ? String(sellerSku) : '' })
        const it = items[index]
        result.push({
          orderId: it.orderId,
          orderStatus: it.orderStatus,
          orderSubstatus: it.orderSubstatus,
          cancelationReturnType: it.cancelationReturnType,
          normalOrPreOrder: it.normalOrPreOrder,
          skuId: it.skuId,
          sellerSku: it.sellerSku,
          productName: it.productName,
          variation: it.variation,
          quantity: it.quantity,
          skuQuantityOfReturn: it.skuQuantityOfReturn,
          skuUnitOriginalPrice: it.skuUnitOriginalPrice,
          skuSubtotalBeforeDiscount: it.skuSubtotalBeforeDiscount,
          skuPlatformDiscount: it.skuPlatformDiscount,
          skuSellerDiscount: it.skuSellerDiscount,
          skuSubtotalAfterDiscount: it.skuSubtotalAfterDiscount,
          shippingFeeAfterDiscount: it.shippingFeeAfterDiscount,
          originalShippingFee: it.originalShippingFee,
          shippingFeeSellerDiscount: it.shippingFeeSellerDiscount,
          shippingFeePlatformDiscount: it.shippingFeePlatformDiscount,
          taxes: it.taxes,
          smallOrderFee: it.smallOrderFee,
          orderAmount: it.orderAmount,
          orderRefundAmount: it.orderRefundAmount,
          createdTime: it.createdTime,
          paidTime: it.paidTime,
          rtsTime: it.rtsTime,
          shippedTime: it.shippedTime,
          deliveredTime: it.deliveredTime,
          cancelledTime: it.cancelledTime,
          cancelBy: it.cancelBy,
          cancelReason: it.cancelReason,
          fulfillmentType: it.fulfillmentType,
          warehouseName: it.warehouseName,
          trackingId: it.trackingId,
          deliveryOption: it.deliveryOption,
          shippingProviderName: it.shippingProviderName,
          buyerMessage: buyerMessage,
          buyerUsername: buyerUsername,
          recipient: recipient,
          phone: phone,
          zipcode: zipcode,
          country: country,
          province: province,
          district: district,
          detailAddress: detailAddress,
          additionalAddressInformation: additionalAddressInformation,
          paymentMethod: it.paymentMethod,
          weight: it.weight,
          productCategory: it.productCategory,
          packageId: it.packageId,
          sellerNote: it.sellerNote,
          checkedStatus: it.checkedStatus,
          checkedMarkedBy: it.checkedMarkedBy,
          profitCenter: productMasterData?.profitCenter || ''
        })
      }
    }
    console.log({ result })
    // console.log(JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    throw throwError(error, 'computeResultItemsOrderTiktok')
  }
}

export const coreProcessCheckDuplicateTiktokOrder = async (fileDetail: iResponseFileUpload, userId: number): Promise<{ checker: boolean; message: string; data?: any[] }> => {
  try {
    const { fileName, path, SalesPlatform, type } = fileDetail as iResponseFileUpload
    const excelFilePath: string = `${path}/${fileName}`
    if (SalesPlatform?.name !== 'TIKTOK') return { checker: false, message: 'INVALID_FILE_TYPE', data: [] }
    const { data: tiktokOrder } = await dynamicProcessExtractAndAnalysisOrder(excelFilePath, 'tiktok', type)
    const mapTiktokOrder = await Promise.all(
      tiktokOrder.map(async order => {
        const { recipient, orderId, sellerSku } = order
        const { name1: name } = await splitNameChannalTiktok(recipient)
        return {
          purchaseOrder: String(orderId),
          name,
          materialProductCode: sellerSku ? String(sellerSku) : ''
        }
      })
    )

    const { data: response } = await checkDuplicateOrdersTiktokInDB(mapTiktokOrder)
    const dataResponse = response.map(
      ({ id, accountCode, salesmanCode, purchaseOrder, invoiceDate, name, address, address2, postCode, city, tel, requireTaxInvoice, materialProductCode, itemCat, quantity, mg4, profitCenter, UOM, plant, storageLocation, SORPrice }) => ({
        accountCode,
        id,
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
        materialProductCode,
        itemCat,
        quantity,
        mg4,
        profitCenter,
        UOM,
        plant,
        storageLocation,
        SORPrice
      })
    )

    return { checker: true, message: 'GET_DATA_SUCCESS', data: dataResponse }
  } catch (error) {
    console.log({ error })
    throw throwError(error, ' coreProcessCheckDuplicateTiktokOrder')
  }
}
