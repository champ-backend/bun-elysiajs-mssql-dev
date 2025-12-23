import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const createUser = async (createObject: Prisma.UserCreateInput) => {
  try {
    return await prisma.$transaction(async tx => {
      const response = await tx.user.create({
        data: createObject
      })
      return { data: response }
    })
  } catch (error) {
    throw throwError(error, 'createUser')
  }
}

export const findUserUnique = async (where: Prisma.UserWhereUniqueInput) => {
  try {
    const response = await prisma.user.findUnique({
      where: where
    })
    return { data: response }
  } catch (error) {
    throw throwError(error, 'findUserUnique')
  }
}

export const findUserWhere = async (filter: Prisma.UserWhereInput) => {
  try {
    const response = await prisma.user.findFirst({
      where: filter,
      orderBy: { createdAt: 'desc' },
      take: 1
    })
    return { data: response }
  } catch (error) {
    throw throwError(error instanceof Error ? error : new Error(String(error)), 'findUserWhere')
  }
}

export const findAndUpdateUser = async (where: Prisma.UserWhereUniqueInput, set: Prisma.UserUpdateInput) => {
  try {
    const existing = await prisma.user.findUnique({ where })
    if (!existing) return { data: null }
    const response = await prisma.user.update({
      where: {
        ...where
      },
      data: {
        ...set
      }
    })

    return { data: response }
  } catch (error) {
    throw throwError(error, 'findAndUpdateUser')
  }
}

export const findManyUserWhere = async (filter: Prisma.UserWhereInput) =>
  prisma.user
    .findMany({ where: filter })
    .then(response => ({ data: response }))
    .catch(error => {
      throw throwError(error, 'findManyUserWhere')
    })
