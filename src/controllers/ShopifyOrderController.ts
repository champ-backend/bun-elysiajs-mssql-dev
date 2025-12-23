import { throwError } from '@/libs/ErrorService'
import { processExtractAndAnalysisOrder } from '@/controllers/ExtractFileController'
import { iResponseFileUpload } from '@/interfaces/FileSystem'
import { Prisma } from '@prisma/client'
import { createOneOrderTransaction, upsertOrderTransactionsUnique } from '@/models/OrderTransaction'
import { iContextParamsPagination } from '@/interfaces/Context'
import { checkDuplicateOrdersInDB, createOneShopifyOrder, findAndDeleteShopifyOrderTransaction, prismaUpdateShopifyOrderTransaction, upsertShopifyOrderUnique } from '@/models/ShopifyOrder'
import { excelSerialDateToMoment } from '@/libs/Excel'
import { findProductMasterUnique } from '@/models/ProductMaster'
import { extractFields, extractFieldsTaxId } from '@/libs/ExtractFields'
import { materialProductCodeValidate, orderTransactionValidate } from '@/controllers/OrderTransactionValidateController'
import { TaxCustomData } from '@/interfaces/ShopifyFujifilmOrder'
import { findUniqueVatRatesWhere } from '@/models/VatRates'
import { extractVat } from '@/libs/OrderTransactions'
import { iResultShopifyItem } from '@/interfaces/OrderTransaction'
import { splitAddressShopify, splitAddressShopifyWithNoteAttributes, splitNameAndCheckInvoiceTypeShopify } from '@/libs/Address'

async function extractTaxData(noteAttributes: string): Promise<TaxCustomData> {
  const data: Partial<TaxCustomData> = {}
  const lines = noteAttributes.split(/\r?\n/)
  lines.forEach(line => {
    const [key, value] = line.split(': ')
    if (key && value !== undefined) {
      ;(data as any)[key.trim()] = value.trim()
    }
  })
  return data as TaxCustomData
}

export const coreProcessCreateShopifyOrder = async (fileDetail: iResponseFileUpload, userId: number, objectBody?: any): Promise<{ checker: boolean; message: string; data?: any[]; errors?: object }> => {
  try {
    const createdShopifyOrders = []
    const createdOrderTransactions = []
    const { accountCode, salesmanCode, plant, storageLocation, country = 'TH' } = objectBody
    const { fileName, path, SalesPlatform, type } = fileDetail as iResponseFileUpload
    const excelFilePath: string = `${path}/${fileName}`
    if (SalesPlatform?.name !== 'SHOPIFY') return { checker: false, message: 'INVALID_FILE_TYPE', data: [] }
    const [{ data: shopifyOrder }, { data: countryData }] = await Promise.all([processExtractAndAnalysisOrder(excelFilePath, 'shopify', type), findUniqueVatRatesWhere({ country })])
    if (!countryData) return { checker: false, message: 'INVALID_VAT_RATE', data: [] }
    const { rate } = countryData as { rate: Prisma.Decimal }
    const mappedShopifyOrders = await Promise.all(
      shopifyOrder
        .filter(order => order.name && order.createdAt && order.lineitemSku)
        .map(async order => {
          let noteAttributesAddress: string = ''
          let noteAttributesAddress2: string = ''
          let noteAttributesName: string = ''
          let noteAttributesName2: string = ''
          let splitBillingName: string = ''
          let splitBillingName2: string = ''
          let splitBillingAddress: string = ''
          let splitBillingAddress2: string = ''
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
            paymentReferences,
            subtotalErrorCase,
            profitCenter
          } = order
          let extractedNoteAttributesData = null
          if (noteAttributes) extractedNoteAttributesData = await extractTaxData(noteAttributes)
          const resTaxId = await extractFieldsTaxId(notes)
          const { data: productMasterData } = await findProductMasterUnique({ material: lineitemSku })
          const checkRequireTaxInvoice = extractedNoteAttributesData?.TaxCustomValid === 'true'

          if (checkRequireTaxInvoice) {
            const { address, address2 } = await splitAddressShopifyWithNoteAttributes(`${extractedNoteAttributesData?.TaxCustomAddress1}`, `${extractedNoteAttributesData?.TaxCustomSubdistrict}`)
            noteAttributesAddress = address || ''
            noteAttributesAddress2 = address2 || ''
            const { name1, name2 } = await splitNameAndCheckInvoiceTypeShopify(`${extractedNoteAttributesData?.TaxCustomName}`)
            noteAttributesName = name1 || ''
            noteAttributesName2 = name2 || ''
          }

          if (!checkRequireTaxInvoice) {
            const { name1, name2 } = await splitNameAndCheckInvoiceTypeShopify(`${billingName}`)
            splitBillingName = name1 || ''
            splitBillingName2 = name2 || ''
            const { address, address2 } = await splitAddressShopify(billingAddress1)
            splitBillingAddress = address || ''
            splitBillingAddress2 = address2 || ''
          }

          return {
            accountCode: accountCode ? accountCode : 9155000402,
            salesmanCode: salesmanCode ? salesmanCode : 115,
            purchaseOrder: String(name),
            invoiceDate: createdAt ? excelSerialDateToMoment(Math.abs(createdAt)).format() : '',
            name: checkRequireTaxInvoice ? noteAttributesName : splitBillingName,
            name2: checkRequireTaxInvoice ? noteAttributesName2 : splitBillingName2,
            address: checkRequireTaxInvoice ? noteAttributesAddress : splitBillingAddress,
            address2: checkRequireTaxInvoice ? (noteAttributesAddress2 !== '' ? noteAttributesAddress2 : null) : splitBillingAddress2,
            address3: checkRequireTaxInvoice ? `${extractedNoteAttributesData?.TaxCustomSubdistrict} ${extractedNoteAttributesData?.TaxCustomDistrict}` : null,
            postCode: checkRequireTaxInvoice ? extractedNoteAttributesData?.TaxCustomPostcode : (billingZip ?? '').replace(/^'/, ''),
            city: checkRequireTaxInvoice ? extractedNoteAttributesData?.TaxCustomProvince : billingCity,
            tel: checkRequireTaxInvoice ? extractedNoteAttributesData?.TaxCustomPhone : billingPhone ? billingPhone : null,
            requireTaxInvoice: checkRequireTaxInvoice,
            taxId: checkRequireTaxInvoice ? String(extractedNoteAttributesData?.TaxCustomID) : resTaxId ? String(resTaxId) : null,
            materialProductCode: lineitemSku,
            itemCat: total > 0 ? 'TAN' : 'ZFRC',
            mg4: total ? null : 'ZZZ',
            quantity: lineitemQuantity,
            profitCenter,
            UOM: productMasterData?.baseUnit ?? '',
            plant: plant ? plant : 'ZT50',
            storageLocation: storageLocation ? storageLocation : 'ZT50',
            SORPrice: total,
            orderName: name,
            email,
            financialStatus,
            fulfillmentStatus,
            fulfilledAt: fulfilledAt ? excelSerialDateToMoment(Math.abs(fulfilledAt)).format() : null,
            acceptsMarketing,
            currency,
            subtotal,
            shipping,
            taxes,
            discountCode,
            discountAmount,
            shippingMethod,
            orderCreatedAt: createdAt ? excelSerialDateToMoment(Math.abs(createdAt)).format() : null,
            lineitemPrice,
            lineitemCompareAtPrice,
            lineitemName,
            lineitemRequiresShipping: !!lineitemRequiresShipping,
            lineitemTaxable: !!lineitemTaxable,
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
            cancelledAt: cancelledAt ? excelSerialDateToMoment(Math.abs(cancelledAt)).format() : null,
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
            nextPaymentDueAt: nextPaymentDueAt ? excelSerialDateToMoment(Math.abs(nextPaymentDueAt)).format() : null,
            paymentReferences,
            subtotalErrorCase
          }
        })
    )

    const { checker: checkerShopify, errors: dataShopify } = (await orderTransactionValidate(mappedShopifyOrders)) as { checker: boolean; message: string; errors?: any[] }
    if (!checkerShopify) return { checker: checkerShopify, message: 'POST_DATA_FAILED', data: dataShopify }
    const { checker: checkerProductMaster, errors: dataProductMaster } = await materialProductCodeValidate(mappedShopifyOrders)
    if (!checkerProductMaster) return { checker: checkerProductMaster, message: 'POST_DATA_FAILED', data: dataProductMaster || [] }
    const dataFinancialStatus = mappedShopifyOrders.filter(order => order.financialStatus === 'paid' && order.subtotalErrorCase == false)
    const dataPriceUnitInvalid = mappedShopifyOrders.filter(order => order.financialStatus === 'paid' && order.subtotalErrorCase == true) || []
    const dataExpiredUnitPrice = mappedShopifyOrders.filter(order => order.financialStatus === 'expired') || []
    const createFinancial = dataFinancialStatus.map(({ subtotalErrorCase, ...rest }) => rest)

    const invalidOrdersSummary = []
    const expiredUnitPriceSummary = []

    for (const order of dataPriceUnitInvalid) {
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
      } = order
      invalidOrdersSummary.push({
        accountCode: accountCode.toString(),
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
      })
    }
    for (const order of dataExpiredUnitPrice) {
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
      } = order
      expiredUnitPriceSummary.push({
        accountCode: accountCode.toString(),
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
      })
    }

    for (let index = 0; index < createFinancial.length; index++) {
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
      } = createFinancial[index]

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

      createFinancial[index].SORPrice = SORPriceExVat.priceExVat
      const [{ data: createdShopifyOrder }, { data: createdOrderTransaction }] = await Promise.all([
        upsertShopifyOrderUnique(
          {
            uniqueShopifyOrder: { ...whereUnique }
          },
          { ...createFinancial[index], taxId: createFinancial[index].taxId !== null ? String(createFinancial[index].taxId) : null },
          { ...createFinancial[index], taxId: createFinancial[index].taxId !== null ? String(createFinancial[index].taxId) : null }
        ),
        upsertOrderTransactionsUnique(
          {
            uniqueOrderTransaction: { ...whereUnique }
          },
          objectOrderTransaction,
          objectOrderTransaction
        )
      ])
      createdShopifyOrders.push(createdShopifyOrder)
      createdOrderTransactions.push(createdOrderTransaction)
    }
    return {
      checker: true,
      message: 'POST_DATA_SUCCESS',
      data: createdOrderTransactions,
      errors: { expired: invalidOrdersSummary, priceUnitValid: expiredUnitPriceSummary }
    }
  } catch (error) {
    console.log({ error })
    throw throwError(error, 'coreProcessCreateShopifyOrder')
  }
}

// export const listShopifyOrderTransactions = async (where: object, userId: number, pagination: iContextParamsPagination): Promise<{ data: object[]; count: number }> => {
//   try {
//     const { data: shopifyOrderTransactions, count } = await findAndCountShopifyOrderTransactions(where, userId, pagination)
//     return { data: shopifyOrderTransactions, count }
//   } catch (error) {
//     throw throwError(error, 'listShopifyOrderTransactions')
//   }
// }

export const updateShopifyOrderTransaction = async (where: Prisma.ShopifyOrderWhereUniqueInput, set: any) => {
  try {
    return await prismaUpdateShopifyOrderTransaction(where, set)
  } catch (error) {
    throw throwError(error, 'updateShopifyOrderTransaction')
  }
}

export const deleteShopifyOrderTransaction = async (where: Prisma.ShopifyOrderWhereUniqueInput) => {
  try {
    return await findAndDeleteShopifyOrderTransaction(where)
  } catch (error) {
    throw throwError(error, 'deleteShopifyOrderTransaction')
  }
}

export const coreProcessCheckDuplicateShopifyOrder = async (fileDetail: iResponseFileUpload, userId: number): Promise<{ checker: boolean; message: string; data?: any[] }> => {
  try {
    const { fileName, path, SalesPlatform, type } = fileDetail as iResponseFileUpload
    const excelFilePath: string = `${path}/${fileName}`
    if (SalesPlatform?.name !== 'SHOPIFY') return { checker: false, message: 'INVALID_FILE_TYPE', data: [] }
    const { data: shopifyOrder } = await processExtractAndAnalysisOrder(excelFilePath, 'shopify', type)
    const mapShopifyOrder = shopifyOrder.map(order => {
      const { id, billingName, lineitemSku } = order
      return {
        purchaseOrder: String(id),
        name: billingName,
        materialProductCode: lineitemSku
      }
    })

    const { data: response } = await checkDuplicateOrdersInDB(mapShopifyOrder)
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
    throw throwError(error, ' coreProcessCheckDuplicateShopifyOrder')
  }
}

export async function computeItemsorderShopify(data: any): Promise<iResultShopifyItem[]> {
  // สร้างแผนที่ order โดยใช้ name เป็น key
  const orderMap = new Map<string, iResultShopifyItem[]>()
  for (const item of data) {
    if (!orderMap.has(item.name)) orderMap.set(item.name, [])
    orderMap.get(item.name)!.push(item)
  }

  // console.log(orderMap)
  const result: iResultShopifyItem[] = []
  for (const [name, items] of orderMap) {
    // หา discountAmount จากรายการแรกที่เจอ
    const orderDiscount = items.find(it => typeof it.discountAmount === 'number')?.discountAmount ?? 0
    // คำนวณ subtotal ของ order
    const { subtotal, shippingTotal } = items.reduce(
      (acc, it) => {
        const quantity = Number(it.lineitemQuantity) || 0
        const price = Number(it.lineitemPrice) || 0
        const ship = Number(it.shipping) || 0
        acc.subtotal += quantity * price
        acc.shippingTotal += ship
        return acc
      },
      { subtotal: 0, shippingTotal: 0 }
    )
    // แจกส่วนลดต่อ item ตามสัดส่วน
    for (let i = 0; i < items.length; ++i) {
      const {
        financialStatus,
        paidAt,
        fulfillmentStatus,
        fulfilledAt,
        acceptsMarketing,
        currency,
        shipping,
        taxes,
        total,
        discountCode,
        discountAmount,
        billingName,
        billingStreet,
        billingAddress1,
        billingCity,
        billingZip,
        billingProvince,
        billingCountry,
        billingPhone,
        shippingName,
        shippingStreet,
        shippingAddress1,
        shippingCity,
        shippingZip,
        shippingProvince,
        shippingCountry,
        shippingPhone,
        paymentMethod,
        paymentReference,
        refundedAmount,
        outstanding,
        employee,
        id,
        riskLevel,
        source,
        billingProvinceName,
        shippingProvinceName,
        paymentId,
        paymentReferences,
        noteAttributes,
        name,
        vendor,
        lineitemDiscount,
        createdAt,
        lineitemQuantity,
        lineitemName,
        lineitemPrice,
        lineitemSku,
        lineitemRequiresShipping,
        lineitemTaxable,
        lineitemFulfillmentStatus
      } = items[0]
      const it = items[i]
      const lineitemSubtotal = (it.lineitemQuantity || 0) * (it.lineitemPrice || 0)
      const discountPerItem = subtotal > 0 ? (orderDiscount + shippingTotal) * (lineitemSubtotal / subtotal) : 0

      result.push({
        id: id as number,
        financialStatus,
        paidAt,
        fulfillmentStatus,
        fulfilledAt,
        acceptsMarketing,
        currency,
        shipping,
        taxes,
        total: Math.round((lineitemSubtotal - discountPerItem) * 100) / 100,
        discountCode,
        discountAmount,
        billingName,
        billingStreet,
        billingAddress1,
        billingCity,
        billingZip,
        billingProvince,
        billingCountry,
        billingPhone,
        shippingName,
        shippingStreet,
        shippingAddress1,
        shippingCity,
        shippingZip,
        shippingProvince,
        shippingCountry,
        shippingPhone,
        paymentMethod,
        paymentReference,
        refundedAmount,
        outstanding,
        employee,
        riskLevel,
        source,
        billingProvinceName,
        shippingProvinceName,
        paymentId,
        paymentReferences,
        name: it.name,
        createdAt: it.createdAt,
        lineitemQuantity: it.lineitemQuantity,
        lineitemName: it.lineitemName,
        lineitemPrice: it.lineitemPrice,
        lineitemSku: it.lineitemSku,
        lineitemRequiresShipping: it.lineitemRequiresShipping,
        lineitemTaxable: it.lineitemTaxable,
        lineitemFulfillmentStatus: it.lineitemFulfillmentStatus,
        vendor: it.vendor,
        lineitemDiscount: it.lineitemDiscount,
        noteAttributes: it.noteAttributes,
        lineitemSubtotal,
        subtotal,
        calDiscountAmount: orderDiscount,
        calDiscountPerItem: Math.round(discountPerItem * 100) / 100, // ปัด 2 ตำแหน่ง
        calDiscountAmountPerItem: (lineitemSubtotal / subtotal) * orderDiscount,
        calNetPrice: Math.round((lineitemSubtotal - discountPerItem) * 100) / 100
      })
    }
  }

  // console.log({ result })

  return result
}

export async function computeResultItemsOrderShopifyTest(data: any): Promise<iResultShopifyItem[]> {
  try {
    const orderMap = new Map<string, iResultShopifyItem[]>()
    for (const item of data) {
      if (!orderMap.has(item.name)) orderMap.set(item.name, [])
      orderMap.get(item.name)!.push(item)
    }
    const result: iResultShopifyItem[] = []
    for (const [name, items] of orderMap) {
      for (let i = 0; i < items.length; ++i) {
        const {
          financialStatus,
          paidAt,
          fulfillmentStatus,
          fulfilledAt,
          acceptsMarketing,
          currency,
          shipping,
          taxes,
          total,
          discountCode,
          discountAmount,
          billingName,
          billingStreet,
          billingAddress1,
          billingCity,
          billingZip,
          billingProvince,
          billingCountry,
          billingPhone,
          shippingName,
          shippingStreet,
          shippingAddress1,
          shippingCity,
          shippingZip,
          shippingProvince,
          shippingCountry,
          shippingPhone,
          paymentMethod,
          paymentReference,
          refundedAmount,
          outstanding,
          employee,
          id,
          riskLevel,
          source,
          billingProvinceName,
          shippingProvinceName,
          paymentId,
          paymentReferences,
          noteAttributes,
          name,
          vendor,
          lineitemDiscount,
          createdAt,
          lineitemQuantity,
          lineitemName,
          lineitemPrice,
          lineitemSku,
          lineitemRequiresShipping,
          lineitemTaxable,
          subtotal,
          lineitemFulfillmentStatus
        } = items[0]
        const it = items[i]

        result.push({
          id: id as number,
          financialStatus,
          paidAt,
          fulfillmentStatus,
          fulfilledAt,
          acceptsMarketing,
          currency,
          shipping,
          taxes,
          total: it.subtotal | 0,
          discountCode,
          discountAmount,
          billingName,
          billingStreet,
          billingAddress1,
          billingCity,
          billingZip,
          billingProvince,
          billingCountry,
          billingPhone,
          shippingName,
          shippingStreet,
          shippingAddress1,
          shippingCity,
          shippingZip,
          shippingProvince,
          shippingCountry,
          shippingPhone,
          paymentMethod,
          paymentReference,
          refundedAmount,
          outstanding,
          employee,
          riskLevel,
          source,
          billingProvinceName,
          shippingProvinceName,
          paymentId,
          paymentReferences,
          name: it.name,
          createdAt: it.createdAt,
          lineitemQuantity: it.lineitemQuantity,
          lineitemName: it.lineitemName,
          lineitemPrice: it.lineitemPrice,
          lineitemSku: it.lineitemSku,
          lineitemRequiresShipping: it.lineitemRequiresShipping,
          lineitemTaxable: it.lineitemTaxable,
          lineitemFulfillmentStatus: it.lineitemFulfillmentStatus,
          vendor: it.vendor,
          lineitemDiscount: it.lineitemDiscount,
          noteAttributes: it.noteAttributes,
          subtotal
        })
      }
    }

    console.log(JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    throw throwError(error, 'computeResultItemOrderShopify')
  }
}

export async function computeResultItemsOrderShopify(data: any): Promise<iResultShopifyItem[]> {
  const orderMap = new Map<string, iResultShopifyItem[]>()
  for (const item of data) {
    if (!orderMap.has(item.name)) orderMap.set(item.name, [])
    orderMap.get(item.name)!.push(item)
  }

  const result: iResultShopifyItem[] = []
  for (const [name, items] of orderMap) {
    // หา discountAmount จากรายการแรกที่เจอ
    // const orderDiscount = items.find(it => typeof it.discountAmount === 'number')?.discountAmount ?? 0
    const { subtotal, shippingTotal } = items.reduce(
      (acc, it) => {
        const quantity = Number(it.lineitemQuantity) || 0
        const price = Number(it.lineitemPrice) || 0
        const ship = Number(it.shipping) || 0
        acc.subtotal += quantity * price
        acc.shippingTotal += ship
        return acc
      },
      { subtotal: 0, shippingTotal: 0 }
    )
    for (let i = 0; i < items.length; ++i) {
      const {
        financialStatus,
        paidAt,
        fulfillmentStatus,
        fulfilledAt,
        acceptsMarketing,
        currency,
        shipping,
        taxes,
        total,
        discountCode,
        discountAmount,
        billingName,
        billingStreet,
        billingAddress1,
        billingCity,
        billingZip,
        billingProvince,
        billingCountry,
        billingPhone,
        shippingName,
        shippingStreet,
        shippingAddress1,
        shippingCity,
        shippingZip,
        shippingProvince,
        shippingCountry,
        shippingPhone,
        paymentMethod,
        paymentReference,
        refundedAmount,
        outstanding,
        employee,
        id,
        riskLevel,
        source,
        billingProvinceName,
        shippingProvinceName,
        paymentId,
        paymentReferences,
        noteAttributes,
        name,
        vendor,
        lineitemDiscount,
        createdAt,
        lineitemQuantity,
        lineitemName,
        lineitemPrice,
        lineitemSku,
        lineitemRequiresShipping,
        lineitemTaxable,
        lineitemFulfillmentStatus,
        subtotal: subtotalIndex0
      } = items[0]

      const it = items[i]
      const lineitemSubtotal = (it.lineitemQuantity || 0) * (it.lineitemPrice || 0)
      const { data: productMasterData } = await findProductMasterUnique({ material: lineitemSku || '' })
      result.push({
        id: id as number,
        financialStatus,
        paidAt,
        fulfillmentStatus,
        fulfilledAt,
        acceptsMarketing,
        currency,
        shipping,
        taxes,
        total: lineitemSubtotal,
        discountCode,
        discountAmount,
        billingName,
        billingStreet,
        billingAddress1,
        billingCity,
        billingZip,
        billingProvince,
        billingCountry,
        billingPhone,
        shippingName,
        shippingStreet,
        shippingAddress1,
        shippingCity,
        shippingZip,
        shippingProvince,
        shippingCountry,
        shippingPhone,
        paymentMethod,
        paymentReference,
        refundedAmount,
        outstanding,
        employee,
        riskLevel,
        source,
        billingProvinceName,
        shippingProvinceName,
        paymentId,
        paymentReferences,
        name: it.name,
        createdAt: it.createdAt,
        lineitemQuantity: it.lineitemQuantity,
        lineitemName: it.lineitemName,
        lineitemPrice: it.lineitemPrice,
        lineitemSku: it.lineitemSku,
        lineitemRequiresShipping: it.lineitemRequiresShipping,
        lineitemTaxable: it.lineitemTaxable,
        lineitemFulfillmentStatus: it.lineitemFulfillmentStatus,
        vendor: it.vendor,
        lineitemDiscount: it.lineitemDiscount,
        noteAttributes: it.noteAttributes,
        lineitemSubtotal,
        subtotal,
        subtotalErrorCase: subtotal != subtotalIndex0 ? true : false,
        profitCenter: productMasterData?.profitCenter || ''
      })
    }
  }
  // console.log({ result })
  console.log(JSON.stringify(result, null, 2))
  return result
}
