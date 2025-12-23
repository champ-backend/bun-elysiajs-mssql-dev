import { iContextParamsPagination } from '@/interfaces/Context'
import { iInformation } from '@/interfaces/Information'
import { iQueryOrderTransaction } from '@/interfaces/OrderTransaction'
import { convertQueryStringToBoolean } from '@/libs/ConvertData'
import { createDateAndTimeObject } from '@/libs/DateTimeWithMoment'
import { throwError } from '@/libs/ErrorService'
import { countOrderTransactions, findOrderTransactionsWhereInputPagination, findWhereAndIncludeOrderTransaction } from '@/models/OrderTransaction'

export const listsOrderTransactionsPagination = async (params: iContextParamsPagination, query: object, information: object): Promise<{ data: any[]; count: number }> => {
  try {
    const { limit, offset, sort, order } = params
    const {
      searchStart,
      searchEnd,
      typePlatform,
      purchaseOrder,
      accountCode,
      salesmanCode,
      address,
      address2,
      address3,
      postCode,
      city,
      tel,
      requireTaxInvoice,
      taxId,
      itemCat,
      quantity,
      mg4,
      UOM,
      storageLocation,
      SORPrice,
      userId,
      username,
      name,
      name2,
      firstname,
      lastname,
      profitCenter,
      materialProductCode,
      search
    } = query as iQueryOrderTransaction
    const { where: whereDateAndTime } = await createDateAndTimeObject(searchStart, searchEnd, order)
    const querySearch = {
      OR: [
        { purchaseOrder: { contains: search } },
        { name: { contains: search } },
        { address: { contains: search } },
        { address2: { contains: search } },
        { address3: { contains: search } },
        { postCode: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
        { city: { contains: search } },
        { tel: { contains: search } },
        { taxId: { contains: search } },
        { itemCat: { contains: search } },
        { materialProductCode: { contains: search } },
        { mg4: { contains: search } },
        { UOM: { contains: search } },
        { profitCenter: { contains: search } },
        { plant: { contains: search } },
        { storageLocation: { contains: search } },
        { SalesPlatform: { name: { contains: search } } }
      ]
    }
    const where = {
      ...whereDateAndTime,
      ...(search && { ...querySearch }),
      ...(purchaseOrder && { purchaseOrder: { contains: purchaseOrder } }),
      ...(typePlatform && { SalesPlatform: { name: { contains: typePlatform } } }),
      ...(userId && { userId: +userId }),
      ...(username && { User: { username: { contains: username } } }),
      ...(name && { name: { contains: name } }),
      ...(name2 && { name2: { contains: name2 } }),
      ...(firstname && { User: { firstname: { contains: firstname } } }),
      ...(lastname && { User: { lastname: { contains: lastname } } }),
      ...(profitCenter && { profitCenter: { contains: profitCenter } }),
      ...(materialProductCode && { materialProductCode: { contains: materialProductCode } }),
      ...(accountCode !== undefined && (typeof accountCode === 'number' || !isNaN(Number(accountCode))) && { accountCode: +accountCode }),
      ...(salesmanCode !== undefined && (typeof salesmanCode === 'number' || !isNaN(Number(salesmanCode))) && { salesmanCode: +salesmanCode }),
      ...(address && { address: { contains: address } }),
      ...(address2 && { address2: { contains: address2 } }),
      ...(address3 && { address3: { contains: address3 } }),
      ...(postCode && { postCode: { contains: postCode } }),
      ...(city && { city: { contains: city } }),
      ...(tel && { tel: { contains: tel } }),
      ...(requireTaxInvoice !== undefined &&
        requireTaxInvoice !== null &&
        convertQueryStringToBoolean(typeof requireTaxInvoice === 'string' ? requireTaxInvoice : null) && { requireTaxInvoice: convertQueryStringToBoolean(typeof requireTaxInvoice === 'string' ? requireTaxInvoice : null) }),
      ...(taxId && { taxId: { contains: taxId } }),
      ...(itemCat && { itemCat: { contains: itemCat } }),
      ...(quantity !== undefined && (typeof quantity === 'number' || !isNaN(Number(quantity))) && { quantity: +quantity }),
      ...(mg4 && { mg4: { contains: mg4 } }),
      ...(UOM && { UOM: { contains: UOM } }),
      ...(SORPrice !== undefined && (typeof SORPrice === 'number' || !isNaN(Number(SORPrice))) && { SORPrice: +SORPrice }),
      ...(storageLocation && { storageLocation: { contains: storageLocation } })
    }

    // console.log('querySearch:', JSON.stringify(querySearch, null, 2))
    // console.log('where:', JSON.stringify(where, null, 2))
    const [{ data: orderTransactions }, { count }] = await Promise.all([findOrderTransactionsWhereInputPagination(where, { limit, offset, order, sort }), countOrderTransactions(where)])
    console.log({ orderTransactions, count })

    return { data: orderTransactions, count }
  } catch (error) {
    throw throwError(error, 'listsOrderTransactionsPagination')
  }
}
