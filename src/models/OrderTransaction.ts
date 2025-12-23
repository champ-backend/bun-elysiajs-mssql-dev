import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const createOneOrderTransaction = async (createObject: Prisma.OrderTransactionsCreateInput) =>
  prisma
    .$transaction(tx => tx.orderTransactions.create({ data: createObject }))
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'createOrderTransaction')
    })

export const findAndIncludeOrderTransaction = async (where: Prisma.OrderTransactionsWhereInput) =>
  prisma.orderTransactions
    .findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true
          }
        },
        SalesPlatform: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findAndIncludeOrderTransaction')
    })

export const findOrderTransactionsWhereInputPagination = async (where: Prisma.OrderTransactionsWhereInput, params: { limit: number; offset: number; order: string; sort: string }) => {
  const { limit, offset, order, sort } = params
  return prisma.orderTransactions
    .findMany({
      where: {
        ...where
      },
      take: limit,
      skip: (offset - 1) * limit,
      orderBy: [{ purchaseOrder: 'asc' }, { SORPrice: 'desc' }],
      include: {
        User: {
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true
          }
        },
        SalesPlatform: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    .then(response => {
      return { data: response }
    })
    .catch(error => {
      throw throwError(error, 'findOrderTransactionsWhereInputPagination')
    })
}

export const findWhereAndIncludeOrderTransaction = async (where: Prisma.OrderTransactionsWhereInput, params: { limit: number; offset: number; order: string; sort: string }, whereShopee?: object, whereShopify?: object) => {
  // console.log('ShopeeOrderFilter:', JSON.stringify(where, null, 2))
  // console.log('filterWhereShopee:', JSON.stringify(whereShopee, null, 2))
  const { limit, offset, order, sort } = params
  return prisma.orderTransactions
    .findMany({
      where: {
        ...where
      },
      take: limit,
      skip: (offset - 1) * limit,
      orderBy: {
        [order]: sort.toLowerCase() as 'asc' | 'desc' // Sorting dynamically
      }
      // include: {
      //   ShopeeOrder: Object.keys(whereShopee || {}).length > 0 ? { where: { ...whereShopee } } : true,
      //   ShopifyOrder: Object.keys(whereShopify || {}).length > 0 ? { where: { ...whereShopify } } : true
      // }
    })
    .then(response => {
      return { data: response }
    })
    .catch(error => {
      // console.error('Prisma Query Error:', error)
      throw throwError(error, 'findWhereAndIncludeOrderTransaction')
    })
}

export const upsertOrderTransactionsUnique = async (where: Prisma.OrderTransactionsWhereUniqueInput, createObject: Prisma.OrderTransactionsCreateInput, updateObject: Prisma.OrderTransactionsUpdateInput) =>
  prisma
    .$transaction(tx =>
      tx.orderTransactions.upsert({
        where,
        create: createObject,
        update: updateObject
      })
    )
    .then(response => ({
      data: response
    }))
    .catch(error => {
      throw throwError(error, 'upsertOrderTransactionsUnique')
    })

export const countOrderTransactions = async (where: Prisma.OrderTransactionsWhereInput) => {
  try {
    const count = await prisma.orderTransactions.count({ where })
    return { count }
  } catch (error) {
    console.log('Error counting order transactions:', error)
    throw throwError(error, 'countOrderTransactions')
  }
}

export const findWhereAndGroupOrderTransactions = async (where: Prisma.OrderTransactionsWhereInput) => {
  const grouped = await prisma.orderTransactions.groupBy({
    by: ['materialProductCode', 'plant', 'storageLocation'],
    where: where,
    _sum: {
      quantity: true
    }
  })
  return grouped
}
