import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const createDeviceInformation = async (createObject: Prisma.DeviceInformationCreateInput) => {
  try {
    return await prisma.$transaction(async tx => {
      const response = await tx.deviceInformation.create({
        data: createObject
      })
      return { data: response }
    })
  } catch (error) {
    throw throwError(error, 'createDeviceInformation')
  }
}

export const findDeviceInformationUnique = async (where: Prisma.DeviceInformationWhereUniqueInput) => {
  try {
    const response = await prisma.deviceInformation.findUnique({
      where: where
    })

    return { data: response }
  } catch (error) {
    throw throwError(error, 'findDeviceInformationUnique')
  }
}

export const findFirstDeviceInformation = async (filter: Prisma.DeviceInformationWhereInput) => {
  try {
    const response = await prisma.deviceInformation.findFirst({
      where: filter,
      orderBy: { createdAt: 'desc' },
      take: 1
    })
    return { data: response }
  } catch (error) {
    throw throwError(error instanceof Error ? error : new Error(String(error)), 'findFirstDeviceInformation')
  }
}

export const deleteOneDeviceInformation = async (where: Prisma.DeviceInformationWhereUniqueInput) => {
  try {
    const existingDevice = await prisma.deviceInformation.findFirst({
      where: where
    })
    if (!existingDevice) return { data: null, message: 'device information not found.' }
    const deletedDevice = await prisma.deviceInformation.delete({ where })
    // console.log('Deleted device information:', deletedDevice)
    return { data: deletedDevice }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('Device information not found.')
      }
    }
    throw throwError(error, 'deleteOneDeviceInformation')
  }
}
