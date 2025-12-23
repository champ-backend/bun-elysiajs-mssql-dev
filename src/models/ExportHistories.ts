import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const createExportHistories = async (createObject: Prisma.ExportHistoriesCreateInput) => {
  try {
    return await prisma.$transaction(async tx => {
      const response = await tx.exportHistories.create({
        data: createObject
      })
      return { data: response }
    })
  } catch (error) {
    throw throwError(error, 'createExportHistories')
  }
}

export const countExportHistories = async (where: Prisma.ExportHistoriesWhereInput) => prisma.exportHistories.count({ where })
export const findExportHistories = async (where: Prisma.ExportHistoriesWhereInput, params: { limit: number; offset: number; order: string; sort: string }) => {
  try {
    const { limit, offset, order, sort } = params
    const [data, count] = await prisma.$transaction([
      prisma.exportHistories.findMany({
        where: {
          ...where
        },
        take: limit,
        skip: (offset - 1) * limit,
        orderBy: {
          [order]: sort.toLowerCase() as 'asc' | 'desc'
        },
        include: {
          User: {
            select: {
              id: true,
              username: true,
              firstname: true,
              lastname: true
            }
          }
        }
      }),
      prisma.exportHistories.count({
        where: {
          ...where
        }
      })
    ])
    console.log({ data, count })
    return { data, count }
  } catch (error) {
    throw throwError(error, 'findExportHistories')
  }
}
