import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'
import { iContextParamsPagination } from '@/interfaces/Context'

const prisma = new PrismaClient()

export const createOneShopeeOrder = async (createObject: Prisma.ShopeeOrderCreateInput) =>
  prisma
    .$transaction(tx => tx.shopeeOrder.create({ data: createObject }))
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'createShopeeOrder')
    })

export const createManyShopeeOrder = async (createManyObject: Prisma.ShopeeOrderCreateManyInput[]) =>
  prisma.shopeeOrder
    .createMany({ data: createManyObject })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'createManyShopeeOrder')
    })

export const findShopeeOrderUnique = async (where: Prisma.ShopeeOrderWhereUniqueInput) =>
  prisma.shopeeOrder
    .findUnique({ where })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findShopeeOrderUnique')
    })

export const findFirstShopeeOrder = async (where: Prisma.ShopeeOrderWhereUniqueInput) =>
  prisma.shopeeOrder
    .findFirst({ where })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findFirstShopeeOrder')
    })

export const findManyShopeeOrderWhere = async (filter: Prisma.ShopeeOrderWhereInput) =>
  prisma.shopeeOrder
    .findMany({ where: filter })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findShopeeOrderAllWhere')
    })

export const upsertShopeeOrderUnique = async (where: Prisma.ShopeeOrderWhereUniqueInput, createObject: Prisma.ShopeeOrderCreateInput, updateObject: Prisma.ShopeeOrderUpdateInput) =>
  prisma
    .$transaction(tx =>
      tx.shopeeOrder.upsert({
        where,
        create: createObject,
        update: updateObject
      })
    )
    .then(response => ({
      data: response
    }))
    .catch(error => {
      throw throwError(error, 'upsertShopeeOrderUnique')
    })

// export const findAndCountShopeeOrderTransactions = async (filter: Prisma.ShopeeOrderWhereInput, userId: number, pagination: iContextParamsPagination): Promise<{ data: object[]; count: number }> => {
//   try {
//     const { limit, offset, order, sort } = pagination
//     const [data, totalCount] = await prisma.$transaction([
//       prisma.shopeeOrder.findMany({
//         where: {
//           ...filter,
//           OrderTransactions: {
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
//       prisma.shopeeOrder.count({
//         where: {
//           ...filter,
//           OrderTransactions: {
//             userId: userId
//           }
//         }
//       })
//     ])

//     return { data, count: totalCount }
//   } catch (error) {
//     throw throwError(error, 'findAndCountShopeeOrderTransactions')
//   }
// }
export const prismaUpdateShopeeOrderTransaction = async (where: Prisma.ShopeeOrderWhereUniqueInput, set: Prisma.ShopeeOrderUpdateInput) => {
  try {
    const existing = await prisma.shopeeOrder.findUnique({ where })
    if (!existing) return { data: null }
    const response = await prisma.shopeeOrder.update({
      where: {
        ...where
      },
      data: {
        ...set
      }
    })

    return { data: response }
  } catch (error) {
    throw throwError(error, 'prismaUpdateShopeeOrderTransaction')
  }
}

export const findByIdAndDeleteShopeeOrderTransaction = async (where: Prisma.ShopeeOrderWhereUniqueInput) => {
  try {
    const existing = await prisma.shopeeOrder.findUnique({ where })
    if (!existing) return { data: null }
    const response = await prisma.shopeeOrder.delete({
      where: {
        ...where
      }
    })
    return { data: response }
  } catch (error) {
    throw throwError(error, 'findByIdAndDeleteShopeeOrderTransaction')
  }
}

export const checkDuplicateShopeeOrdersInDB = async (mapShopeeOrder: any[]) =>
  prisma.shopeeOrder
    .findMany({
      where: {
        OR: [...mapShopeeOrder]
      }
    })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'checkDuplicateShopeeOrdersInDB')
    })
