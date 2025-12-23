import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const upsertProductMasterUnique = async (where: Prisma.ProductMasterWhereUniqueInput, createObject: Prisma.ProductMasterCreateInput, updateObject: Prisma.ProductMasterUpdateInput) => {
  try {
    const response = await prisma.productMaster.upsert({
      where,
      create: createObject,
      update: updateObject
    })

    return { data: response }
  } catch (error) {
    // console.error('[UpsertProductMaster] error:', error)
    throw throwError(error, 'upsertProductMasterUnique')
  }
}

export const findProductMasterUnique = async (where: Prisma.ProductMasterWhereUniqueInput) =>
  prisma.productMaster
    .findUnique({ where })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findProductMasterUnique')
    })

export const prismaUpdateProductMaster = async (where: Prisma.ProductMasterWhereUniqueInput, set: Prisma.ProductMasterUpdateInput) => {
  try {
    const existing = await prisma.productMaster.findUnique({ where })
    if (!existing) return { data: null }
    const response = await prisma.productMaster.update({
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
    throw throwError(error, 'prismaUpdateProductMaster')
  }
}

export const prismaFindManyProductMaster = async (where: Prisma.ProductMasterWhereInput, params: { limit: number; offset: number; order: string; sort: string }) => {
  try {
    const { limit, offset, order, sort } = params
    const [data, count] = await prisma.$transaction([
      prisma.productMaster.findMany({
        where: {
          ...where
        },
        take: limit,
        skip: (offset - 1) * limit,
        orderBy: {
          [order]: sort.toLowerCase() as 'asc' | 'desc'
        }
      }),
      prisma.productMaster.count({
        where: {
          ...where
        }
      })
    ])
    console.log({ data, count })
    return { data, count }
  } catch (error) {
    throw throwError(error, 'prismaFindManyProductMaster')
  }
}

export const findManyProductMaster = async (where: Prisma.ProductMasterWhereInput) =>
  prisma.productMaster
    .findMany({ where })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findManyProductMaster')
    })
