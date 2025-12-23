import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const createFileUpload = async (createObject: Prisma.FileUploadCreateInput) => {
  try {
    return await prisma.$transaction(async tx => {
      const response = await tx.fileUpload.create({
        data: createObject
      })
      return { data: response }
    })
  } catch (error) {
    throw throwError(error, 'createFileUpload')
  }
}

export const findFileUploadUnique = async (where: Prisma.FileUploadWhereUniqueInput) => ({ data: await prisma.fileUpload.findUnique({ where, include: { SalesPlatform: true } }) })
