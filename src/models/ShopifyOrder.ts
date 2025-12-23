import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'
import { iContextParamsPagination } from '@/interfaces/Context'

const prisma = new PrismaClient()

export const createOneShopifyOrder = async (createObject: Prisma.ShopifyOrderCreateInput) =>
  prisma
    .$transaction(tx => tx.shopifyOrder.create({ data: createObject }))
    .then(response => ({ data: response }))
    .catch(error => {
      console.log(error)
      throw throwError(error, 'createShopifyOrder')
    })

export const createManyShopifyOrder = async (createManyObject: Prisma.ShopifyOrderCreateManyInput[]) =>
  prisma.shopifyOrder
    .createMany({ data: createManyObject })
    .then(response => ({ data: response }))
    .catch(error => {
      console.log({ error })
      throw throwError(error, 'createManyShopifyOrder')
    })

export const findShopifyOrderUnique = async (where: Prisma.ShopifyOrderWhereUniqueInput) =>
  prisma.shopifyOrder
    .findUnique({ where })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findShopifyOrderUnique')
    })

export const findManyShopifyOrderWhere = async (filter: Prisma.ShopifyOrderWhereInput) =>
  prisma.shopifyOrder
    .findMany({ where: filter })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findShopifyOrderAllWhere')
    })

// export const findAndCountShopifyOrderTransactions = async (filter: Prisma.ShopifyOrderWhereInput, userId: number, pagination: iContextParamsPagination): Promise<{ data: object[]; count: number }> => {
//   try {
//     const { limit, offset, order, sort } = pagination
//     const [data, totalCount] = await prisma.$transaction([
//       prisma.shopifyOrder.findMany({
//         where: {
//           ...filter,
//           OrderTransaction: {
//             userId: userId
//           }
//         },
//         take: limit,
//         skip: (offset - 1) * limit,
//         orderBy: {
//           [order]: sort.toLowerCase() as 'asc' | 'desc'
//         },
//         include: {
//           OrderTransaction: true
//         }
//       }),
//       prisma.shopifyOrder.count({
//         where: {
//           ...filter,
//           OrderTransaction: {
//             userId: userId
//           }z
//         }
//       })
//     ])

//     return { data, count: totalCount }
//   } catch (error) {
//     throw throwError(error, 'findAndCountShopifyOrderTransactions')
//   }
// }

export const prismaUpdateShopifyOrderTransaction = async (where: Prisma.ShopifyOrderWhereUniqueInput, set: Prisma.ShopifyOrderUpdateInput) => {
  try {
    const existing = await prisma.shopifyOrder.findUnique({ where })
    if (!existing) return { data: null }
    const response = await prisma.shopifyOrder.update({
      where: {
        ...where
      },
      data: {
        ...set
      }
    })

    return { data: response }
  } catch (error) {
    console.log({ error })
    throw throwError(error, 'prismaUpdateShopifyOrderTransaction')
  }
}

export const findAndDeleteShopifyOrderTransaction = async (where: Prisma.ShopifyOrderWhereUniqueInput) => {
  try {
    const existing = await prisma.shopifyOrder.findUnique({ where })
    if (!existing) return { data: null }
    const response = await prisma.shopifyOrder.delete({
      where: {
        ...where
      }
    })
    return { data: response }
  } catch (error) {
    throw throwError(error, 'findAndDeleteShopifyOrderTransaction')
  }
}

export const upsertShopifyOrderUnique = async (where: Prisma.ShopifyOrderWhereUniqueInput, createObject: Prisma.ShopifyOrderCreateInput, updateObject: Prisma.ShopifyOrderUpdateInput) =>
  prisma
    .$transaction(tx =>
      tx.shopifyOrder.upsert({
        where,
        create: createObject,
        update: { ...updateObject }
      })
    )
    .then(response => ({
      data: response
    }))
    .catch(error => {
      throw throwError(error, 'upsertShopifyOrderUnique')
    })

export const checkDuplicateOrdersInDB = async (mapShopifyOrder: any[]) =>
  prisma.shopifyOrder
    .findMany({
      where: {
        OR: [...mapShopifyOrder]
      }
    })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'checkDuplicateOrdersInDB')
    })
