import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'
import { iContextParamsPagination } from '@/interfaces/Context'

const prisma = new PrismaClient()

export const upsertTiktokOrderUnique = async (where: Prisma.TiktokOrderWhereUniqueInput, createObject: Prisma.TiktokOrderCreateInput, updateObject: Prisma.TiktokOrderUpdateInput) =>
  prisma
    .$transaction(tx =>
      tx.tiktokOrder.upsert({
        where,
        create: createObject,
        update: updateObject
      })
    )
    .then(response => ({
      data: response
    }))
    .catch(error => {
      throw throwError(error, 'upsertTiktokOrderUnique')
    })

export const checkDuplicateOrdersTiktokInDB = async (mapTiktokOrder: any[]) =>
  prisma.tiktokOrder
    .findMany({
      where: {
        OR: [...mapTiktokOrder]
      }
    })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'checkDuplicateOrdersTiktokInDB')
    })
