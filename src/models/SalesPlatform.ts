import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const createOneSalesPlatformOnline = async (createObject: Prisma.SalesPlatformCreateInput) =>
  prisma
    .$transaction(tx => tx.salesPlatform.create({ data: createObject }))
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'createSalesPlatformOnline')
    })

export const findSalesPlatformUnique = async (where: Prisma.SalesPlatformWhereUniqueInput) =>
  prisma.salesPlatform
    .findUnique({ where })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findSalesPlatformUnique')
    })

export const findManySalesPlatformWhere = async (filter: Prisma.SalesPlatformWhereInput) =>
  prisma.salesPlatform
    .findMany({ where: filter })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findSalesPlatformAllWhere')
    })
