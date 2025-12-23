import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const createVatRatePrisma = async (createObject: Prisma.VatRatesCreateInput) => {
  try {
    return await prisma.$transaction(async tx => {
      const response = await tx.vatRates.create({
        data: createObject
      })
      return { data: response }
    })
  } catch (error) {
    throw throwError(error, 'createVatRatePrisma')
  }
}

export const findManyVatRatesWhere = async (where: Prisma.VatRatesWhereInput) =>
  prisma.vatRates
    .findMany({ where })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findVatRatesAllWhere')
    })

export const findUniqueVatRatesWhere = async (where: Prisma.VatRatesWhereUniqueInput) =>
  prisma.vatRates
    .findUnique({ where })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findUniqueVatRatesWhere')
    })
