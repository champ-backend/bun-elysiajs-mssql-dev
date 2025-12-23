import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const findManyMaterialGroupWhere = async (filter: Prisma.MaterialGroupWhereInput) =>
  prisma.materialGroup
    .findMany({ where: filter })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findManyMaterialGroupWhere')
    })

export const createMaterialGroupOne = async (materialGroups: Prisma.MaterialGroupCreateInput) =>
  prisma
    .$transaction(tx => tx.materialGroup.create({ data: materialGroups }))
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'createMaterialGroupOne')
    })
