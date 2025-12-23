import { throwError } from '@/libs/ErrorService'
import { processExtractAndAnalysisOrder } from '@/controllers/ExtractFileController'
import { iResponseFileUpload } from '@/interfaces/FileSystem'
import { checkDuplicateShopeeOrdersInDB, findByIdAndDeleteShopeeOrderTransaction, findFirstShopeeOrder, prismaUpdateShopeeOrderTransaction, upsertShopeeOrderUnique } from '@/models/ShopeeOrder'
import { Prisma } from '@prisma/client'
import moment from 'moment'
import { createOneOrderTransaction, upsertOrderTransactionsUnique } from '@/models/OrderTransaction'
import { iContextParamsPagination } from '@/interfaces/Context'
import { parseDateWithMoment } from '@/libs/DateTimeWithMoment'
import { findProductMasterUnique } from '@/models/ProductMaster'
import caching from '@/libs/Redis'
import { setCacheResponse } from './RedisController'
import { materialProductCodeValidate, orderTransactionValidate } from './OrderTransactionValidateController'

import { findUniqueVatRatesWhere } from '@/models/VatRates'
import { extractVat } from '@/libs/OrderTransactions'
import { splitAddressWithInvoiceSubDistrict, splitAddressWithShippingAddress, splitNameAndCheckInvoiceTypeShopee } from '@/libs/Address'
import { iResultShopeeItem } from '@/interfaces/OrderTransaction'

export const coreProcessCreateShopeeOrder = async (fileDetail: iResponseFileUpload, userId: number, objectBody?: any): Promise<{ checker: boolean; message: string; data?: any[]; errors?: object }> => {
  try {
    const { accountCode = 9155000390, salesmanCode = 115, plant = 'ZT40', storageLocation = 'ZT45', country = 'TH' } = objectBody
    const { fileName, path, SalesPlatform, type } = fileDetail as iResponseFileUpload
    if (SalesPlatform?.name !== 'SHOPEE') return { checker: false, message: 'INVALID_FILE_TYPE', data: [] }
    const excelFilePath: string = `${path}/${fileName}`
    const [{ data: shopeeOrder }, { data: countryData }] = await Promise.all([processExtractAndAnalysisOrder(excelFilePath, 'shopee', type), findUniqueVatRatesWhere({ country })])
    if (!countryData) return { checker: false, message: 'INVALID_VAT_RATE', data: [] }
    const { rate } = countryData as { rate: Prisma.Decimal }
    const dataShopeeOrder = await Promise.all(
      shopeeOrder
        .filter(order => order.buyerName && order.orderId && order.orderStatus !== 'ยกเลิกแล้ว')
        .map(async order => {
          const invoiceMode = order.buyerInvoiceRequest === 'Yes'
          const {
            orderId,
            paymentTime,
            buyerName,
            shippingAddress,
            shippingPostalCode,
            shippingProvince,
            receiverPhone,
            skuReferenceNo,
            quantity,
            invoiceEmail,
            orderStatus,
            refundStatus,
            orderDate,
            paymentMethod,
            paymentDetails,
            installmentPlan,
            transactionFeePercent,
            shippingOption,
            shippingMethod,
            trackingNumber,
            estimatedDeliveryDate,
            deliveryTime,
            parentSku,
            productName,
            optionName,
            originalPrice,
            salePrice,
            returnedQuantity,
            netSalePrice,
            shopeeDiscount,
            sellerVoucher,
            coinsCashbackSeller,
            shopeeVoucher,
            discountCode,
            bundleDeal,
            bundleDiscountSeller,
            bundleDiscountShopee,
            coinsUsed,
            allPaymentPromotions,
            commissionFee,
            transactionFee,
            totalBuyerPaid,
            shippingFeeBuyer,
            shippingFeeShopee,
            returnShippingFee,
            serviceFee,
            totalAmount,
            estimatedShippingFee,
            receiverName,
            buyerNote,
            shippingCountry,
            shippingDistrict,
            orderType,
            orderSuccessTime,
            orderNotes,
            buyerInvoiceRequest,
            invoiceType,
            invoiceName,
            invoiceBranchType,
            invoiceBranchName,
            invoiceBranchCode,
            invoiceFullAddress,
            invoiceAddressDetails,
            invoiceSubDistrict,
            invoiceDistrict,
            invoiceProvince,
            invoicePostalCode,
            taxpayerId,
            invoicePhoneNumber,
            category,
            SOR_ApasNumber,
            codeSales,
            invoiceReceipt,
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
          if (invoiceMode) {
            const result = await splitAddressWithInvoiceSubDistrict(invoiceFullAddress, invoiceSubDistrict)
            const { name1, name2 } = await splitNameAndCheckInvoiceTypeShopee(invoiceName)
            address = result.address
            address2 = result.address2
            invoiceName1 = name1
            invoiceName2 = name2
          }

          if (!invoiceMode) {
            const result = await splitAddressWithShippingAddress(shippingAddress)
            const { name1, name2 } = await splitNameAndCheckInvoiceTypeShopee(buyerName)
            addressShiping = result.address
            addressShiping2 = result.address2
            buyerName1 = name1
            buyerName2 = name2
          }

          const { data: productMasterData } = await findProductMasterUnique({ material: skuReferenceNo.trim() })
          return {
            accountCode: accountCode ? accountCode : 9155000390,
            salesmanCode: salesmanCode ? salesmanCode : 115,
            purchaseOrder: orderId,
            invoiceDate: parseDateWithMoment(orderDate) || '',
            name: invoiceMode ? invoiceName1 : buyerName1,
            name2: invoiceMode ? invoiceName2 : buyerName2,
            address: invoiceMode ? address : addressShiping,
            address2: invoiceMode ? address2 : addressShiping2,
            address3: invoiceMode ? `${invoiceSubDistrict} ${invoiceDistrict}` : shippingDistrict,
            postCode: invoiceMode ? invoicePostalCode : shippingPostalCode,
            city: invoiceMode ? invoiceProvince : shippingProvince,
            tel: invoiceMode ? (invoicePhoneNumber !== '' ? invoicePhoneNumber : null) : null,
            requireTaxInvoice: invoiceMode,
            taxId: invoiceMode ? taxpayerId.padStart(13, '0') : null,
            materialProductCode: skuReferenceNo.trim(),
            quantity,
            itemCat: salePrice != 0 ? 'TAN' : 'ZFRC',
            mg4: salePrice != 0 ? null : 'ZZZ',
            profitCenter,
            UOM: productMasterData?.baseUnit || '',
            plant: plant ? plant : 'ZT40',
            storageLocation: storageLocation ? storageLocation : 'ZT45',
            SORPrice: netSalePrice,
            invoiceEmail,
            orderStatus,
            refundStatus,
            buyerName,
            orderDate: parseDateWithMoment(orderDate),
            paymentMethod,
            paymentDetails,
            installmentPlan,
            transactionFeePercent,
            shippingOption,
            shippingMethod,
            trackingNumber,
            estimatedDeliveryDate: parseDateWithMoment(estimatedDeliveryDate),
            deliveryTime,
            parentSku,
            productName,
            optionName,
            originalPrice,
            salePrice,
            returnedQuantity,
            netSalePrice,
            shopeeDiscount,
            sellerVoucher,
            coinsCashbackSeller,
            shopeeVoucher,
            discountCode,
            bundleDeal,
            bundleDiscountSeller,
            bundleDiscountShopee,
            coinsUsed,
            allPaymentPromotions,
            commissionFee,
            transactionFee,
            totalBuyerPaid,
            totalAmount,
            shippingFeeBuyer,
            shippingFeeShopee,
            returnShippingFee,
            serviceFee,
            estimatedShippingFee,
            receiverName,
            buyerNote,
            shippingCountry,
            shippingDistrict,
            orderType,
            orderSuccessTime,
            orderNotes,
            buyerInvoiceRequest,
            invoiceType,
            invoiceName,
            invoiceBranchType,
            invoiceBranchName,
            invoiceBranchCode,
            invoiceFullAddress,
            invoiceAddressDetails,
            invoiceSubDistrict,
            invoiceDistrict,
            invoiceProvince,
            invoicePostalCode,
            taxpayerId,
            invoicePhoneNumber,
            category,
            SOR_ApasNumber,
            codeSales,
            invoiceReceipt,
            shippingAddress,
            receiverPhone
          }
        })
    )

    const { checker: checkerShopee, message: messageShopee, errors: dataShopee } = (await orderTransactionValidate(dataShopeeOrder)) as { checker: boolean; message: string; errors: any[] }
    if (!checkerShopee) return { checker: checkerShopee, message: 'POST_DATA_FAILED', data: dataShopee || [] }
    const { checker: checkerProductMaster, message: messageProductMaster, errors: dataProductMaster } = await materialProductCodeValidate(dataShopeeOrder)
    if (!checkerProductMaster) return { checker: checkerProductMaster, message: 'POST_DATA_FAILED', data: dataProductMaster || [] }
    const createdShopeeOrders = []
    const createdOrderTransactions = []
    for (let index = 0; index < dataShopeeOrder.length; index++) {
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
      } = dataShopeeOrder[index]
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
      dataShopeeOrder[index].SORPrice = SORPriceExVat.priceExVat
      const [{ data: createdShopeeOrder }, { data: createdOrderTransaction }] = await Promise.all([
        upsertShopeeOrderUnique(
          {
            uniqueShopeeOrder: { ...whereUnique }
          },
          { ...dataShopeeOrder[index] },
          { ...dataShopeeOrder[index] }
        ),
        upsertOrderTransactionsUnique(
          {
            uniqueOrderTransaction: { ...whereUnique }
          },
          objectOrderTransaction,
          objectOrderTransaction
        )
      ])
      createdShopeeOrders.push(createdShopeeOrder)
      createdOrderTransactions.push(createdOrderTransaction)
    }

    return { checker: true, message: 'POST_DATA_SUCCESS', data: createdOrderTransactions || [], errors: {} }
  } catch (error) {
    console.log({ error })
    throw throwError(error, 'coreProcessCreateShopeeOrder')
  }
}

export const updateShopeeOrderTransaction = async (where: Prisma.ShopeeOrderWhereUniqueInput, set: any) => {
  try {
    return await prismaUpdateShopeeOrderTransaction(where, set)
  } catch (error) {
    throw throwError(error, 'updateShopeeOrderTransaction')
  }
}

export const deleteShopeeOrderTransaction = async (where: Prisma.ShopeeOrderWhereUniqueInput) => {
  try {
    return await findByIdAndDeleteShopeeOrderTransaction(where)
  } catch (error) {
    throw throwError(error, 'deleteShopeeOrderTransaction')
  }
}

export const coreProcessCheckDuplicateShopeeOrder = async (fileDetail: iResponseFileUpload, userId: number): Promise<{ checker: boolean; message: string; data?: any[] }> => {
  try {
    const { fileName, path, SalesPlatform } = fileDetail as iResponseFileUpload
    if (SalesPlatform?.name !== 'SHOPEE') return { checker: false, message: 'INVALID_FILE_TYPE', data: [] }
    const excelFilePath: string = `${path}/${fileName}`
    const { data: shopeeOrder } = await processExtractAndAnalysisOrder(excelFilePath, 'shopee')
    const mapShopeeOrder = shopeeOrder.map(order => {
      const { orderId, buyerName, skuReferenceNo } = order
      return {
        purchaseOrder: orderId,
        name: buyerName,
        materialProductCode: skuReferenceNo
      }
    })
    const { data: response } = await checkDuplicateShopeeOrdersInDB(mapShopeeOrder)
    return { checker: true, message: 'GET_DATA_SUCCESS', data: response }
  } catch (error) {
    console.log({ error })
    throw throwError(error, 'coreProcessCheckDuplicateShopeeOrder')
  }
}

export async function computeResultItemsShopee(data: any): Promise<iResultShopeeItem[]> {
  const orderMap = new Map<string, iResultShopeeItem[]>()
  for (const item of data) {
    if (!orderMap.has(item.orderId)) orderMap.set(item.orderId, [])
    orderMap.get(item.orderId)!.push(item)
  }
  console.log(orderMap)

  const result: iResultShopeeItem[] = []
  for (const [orderId, items] of orderMap) {
    for (let i = 0; i < items.length; ++i) {
      const {
        orderId,
        paymentTime,
        buyerName,
        shippingAddress,
        shippingPostalCode,
        shippingProvince,
        receiverPhone,
        skuReferenceNo,
        quantity,
        invoiceEmail,
        orderStatus,
        refundStatus,
        orderDate,
        paymentMethod,
        paymentDetails,
        installmentPlan,
        transactionFeePercent,
        shippingOption,
        shippingMethod,
        trackingNumber,
        estimatedDeliveryDate,
        deliveryTime,
        parentSku,
        productName,
        optionName,
        originalPrice,
        salePrice,
        returnedQuantity,
        netSalePrice,
        shopeeDiscount,
        sellerVoucher,
        coinsCashbackSeller,
        shopeeVoucher,
        discountCode,
        bundleDeal,
        bundleDiscountSeller,
        bundleDiscountShopee,
        coinsUsed,
        allPaymentPromotions,
        commissionFee,
        transactionFee,
        totalBuyerPaid,
        shippingFeeBuyer,
        shippingFeeShopee,
        returnShippingFee,
        serviceFee,
        totalAmount,
        estimatedShippingFee,
        receiverName,
        buyerNote,
        shippingCountry,
        shippingDistrict,
        orderType,
        orderSuccessTime,
        orderNotes,
        buyerInvoiceRequest,
        invoiceType,
        invoiceName,
        invoiceBranchType,
        invoiceBranchName,
        invoiceBranchCode,
        invoiceFullAddress,
        invoiceAddressDetails,
        invoiceSubDistrict,
        invoiceDistrict,
        invoiceProvince,
        invoicePostalCode,
        taxpayerId,
        invoicePhoneNumber,
        category,
        SOR_ApasNumber,
        codeSales,
        invoiceReceipt
      } = items[i]
      const referenceIndex0 = items[0]
      const { data: productMasterData } = await findProductMasterUnique({ material: referenceIndex0.skuReferenceNo.trim() })
      result.push({
        orderId,
        paymentTime,
        buyerName,
        shippingAddress,
        shippingPostalCode,
        shippingProvince,
        receiverPhone,
        skuReferenceNo,
        quantity,
        invoiceEmail,
        orderStatus,
        refundStatus,
        orderDate,
        paymentMethod,
        paymentDetails,
        installmentPlan,
        transactionFeePercent,
        shippingOption,
        shippingMethod,
        trackingNumber,
        estimatedDeliveryDate,
        deliveryTime,
        parentSku,
        productName,
        optionName,
        originalPrice,
        salePrice,
        returnedQuantity,
        netSalePrice,
        shopeeDiscount,
        sellerVoucher,
        coinsCashbackSeller,
        shopeeVoucher,
        discountCode,
        bundleDeal,
        bundleDiscountSeller,
        bundleDiscountShopee,
        coinsUsed,
        allPaymentPromotions,
        commissionFee,
        transactionFee,
        totalBuyerPaid,
        shippingFeeBuyer,
        shippingFeeShopee,
        returnShippingFee,
        serviceFee,
        totalAmount,
        estimatedShippingFee,
        receiverName,
        buyerNote,
        shippingCountry,
        shippingDistrict,
        orderType,
        orderSuccessTime,
        orderNotes,
        buyerInvoiceRequest,
        invoiceType,
        invoiceName,
        invoiceBranchType,
        invoiceBranchName,
        invoiceBranchCode,
        invoiceFullAddress,
        invoiceAddressDetails,
        invoiceSubDistrict,
        invoiceDistrict,
        invoiceProvince,
        invoicePostalCode,
        taxpayerId,
        invoicePhoneNumber,
        category,
        SOR_ApasNumber,
        codeSales,
        invoiceReceipt,
        profitCenter: productMasterData?.profitCenter || ''
      })
    }
  }
  return result
}
