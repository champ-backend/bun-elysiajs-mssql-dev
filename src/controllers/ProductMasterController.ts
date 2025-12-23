import { throwError } from '@/libs/ErrorService'
import { processExtractAndAnalysisOrder, processExtractAndAnalysisProductMaster } from '@/controllers/ExtractFileController'
import { iResponseFileUpload } from '@/interfaces/FileSystem'
import { batchUpsertProductMaster } from 'service/productMasterService'
import { iProductMaster } from '@/interfaces/ProductMaster'
import { prismaFindManyProductMaster, prismaUpdateProductMaster, upsertProductMasterUnique } from '@/models/ProductMaster'
import { iContextParamsPagination } from '@/interfaces/Context'
import { createDateAndTimeObject } from '@/libs/DateTimeWithMoment'

export const autoCreateProductMaster = async (path: string) => {
  try {
    // const result = []
    const excelFilePath: string = `${path}`
    const { data: productMasterData } = await processExtractAndAnalysisProductMaster(excelFilePath)
    const dataBatch = productMasterData.filter(({ material, plant, materialNumber }) => material !== null && plant !== null && materialNumber !== null)
    // for (let index = 0; index < dataBatch.length; index++) {
    //   const { material } = dataBatch[index]
    //   const where = { material }
    //   const createObject = { ...dataBatch[index] }
    //   const updateObject = { ...dataBatch[index] }
    //   const { data: updated } = await upsertProductMasterUnique(where, createObject, updateObject)
    //   result.push(updated)
    // }
    const result = await batchUpsertProductMaster(dataBatch, 1000, 1)
    console.log(`Auto-created Product Master with ${result.length} records from file: ${excelFilePath}`)
  } catch (error) {
    throw throwError(error, 'autoCreateProductMaster')
  }
}

export const coreProcessCreateProductMaster = async (fileDetail: iResponseFileUpload, userId: number): Promise<{ checker: boolean; message: string; data?: any[] }> => {
  try {
    console.log('CORE PROCESS CREATE PRODUCT MASTER', fileDetail)
    const { fileName, path, SalesPlatform } = fileDetail as iResponseFileUpload
    if (SalesPlatform?.name !== 'PRODUCT_MASTER') return { checker: false, message: 'INVALID_FILE_TYPE', data: [] }
    const excelFilePath: string = `${path}/${fileName}`
    const { data: productMasterData } = await processExtractAndAnalysisProductMaster(excelFilePath)
    console.log(productMasterData)
    const result = []
    const dataBatch = productMasterData.filter(({ material, plant, materialNumber }) => material !== null && plant !== null && materialNumber !== null)
    // console.log(JSON.stringify(dataBatch, null, 2))
    for (let index = 0; index < dataBatch.length; index++) {
      const { material } = dataBatch[index]
      const where = { material }
      const createObject = { ...dataBatch[index] }
      const updateObject = { ...dataBatch[index] }
      const { data: updated } = await upsertProductMasterUnique(where, createObject, updateObject)
      result.push(updated)
    }
    // const result = await batchUpsertProductMaster(dataBatch, 1000, 100)
    // console.log({ result })

    return { checker: true, message: 'POST_DATA_SUCCESS', data: result || [] }
  } catch (error) {
    throw throwError(error, 'coreProcessCreateProductMaster')
  }
}

export const updateProductMaster = async (params: iProductMaster, id: number): Promise<{ checker: boolean; message: string; data?: any | null }> => {
  try {
    const { data: updatedProductMaster } = await prismaUpdateProductMaster({ id }, params)
    return { checker: true, message: 'POST_DATA_SUCCESS', data: updatedProductMaster }
  } catch (error) {
    throw throwError(error, 'updateProductMaster')
  }
}

export const listsProductMaster = async (params: iContextParamsPagination, query: any): Promise<{ checker: boolean; message: string; data?: any[]; count: number }> => {
  try {
    const { limit, offset, sort, order } = params
    const { searchStart, searchEnd, material, materialNumber, profitCenter, search, mg1, mg2, baseUnit, materialType } = query
    const { where: whereDateAndTime } = await createDateAndTimeObject(searchStart, searchEnd, order)

    const querySearch = {
      OR: [
        { plant: { contains: search } },
        { material: { contains: search } },
        { materialNumber: { contains: search } },
        { mg1: { contains: search } },
        { mg2: { contains: search } },
        { profitCenter: { contains: search } },
        { baseUnit: { contains: search } },
        { materialType: { contains: search } }
      ]
    }
    const where = {
      ...whereDateAndTime,
      ...(search && { ...querySearch }),
      ...(material ? { material: { contains: material } } : {}),
      ...(materialNumber ? { materialNumber: { contains: materialNumber } } : {}),
      ...(profitCenter ? { profitCenter: { contains: profitCenter } } : {}),
      ...(mg1 && { mg1: { contains: mg1 } }),
      ...(mg2 && { mg2: { contains: mg2 } }),
      ...(baseUnit && { baseUnit: { contains: baseUnit } }),
      ...(materialType && { materialType: { contains: materialType } })
    }

    const { data: productMaster, count } = await prismaFindManyProductMaster(where, { limit, offset, sort, order })
    if (productMaster.length === 0) return { checker: false, message: 'NO_DATA_FOUND', data: [], count: 0 }
    return { checker: true, message: 'GET_DATA_SUCCESS', data: productMaster, count }
  } catch (error) {
    throw throwError(error, 'listsProductMaster')
  }
}
