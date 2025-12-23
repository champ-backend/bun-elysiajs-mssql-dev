import { PrismaClient, Prisma } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const findAllWarehouse = async (where: Prisma.WarehousesWhereInput) => prisma.warehouses.findMany({ where })

export const findAllAndGroupWarehouse = async (where: Prisma.WarehousesWhereInput) => {
  const grouped = await prisma.warehouses.groupBy({
    by: ['material', 'plant', 'storageLocation'],
    where: where,
    _sum: {
      unrestricted: true,
      blocked: true
    }
  })

  return grouped
}
