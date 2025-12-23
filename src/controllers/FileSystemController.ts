import { promises as fs } from 'fs'
import { Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import path from 'path'
import { writeFile } from 'fs/promises'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { createWriteStream } from 'fs'
import { throwError } from '@/libs/ErrorService'
import { createFileUpload } from '@/models/FileSystem'
import { iHandleFileUpload, iResDataPlatform, iResponseFileUpload } from '@/interfaces/FileSystem'
import config from '@/pref/index'
import { checkFileExcelHeaderTypePlatform } from '@/controllers/ExtractFileController'
import { responseFormat } from '@/libs/ResponseFormatter'
import { deleteFileFromLocalStorage } from '@/libs/FileSystem'
import { findSalesPlatformUnique } from '@/models/SalesPlatform'

const prefix: string = config.service.api
export const autoCreateDirectory = async (pathDir: string, dirName: string) => {
  try {
    const datePath = moment().format('YYYYMMDD')
    const directory = path.join(`.${pathDir}${dirName}`, datePath)
    try {
      await fs.access(directory)
      console.log(`⚡ Directory already exists: ${directory}`)
    } catch {
      await fs.mkdir(directory, { recursive: true })
      console.log(`✅ Directory created: ${directory}`)
    }
    console.log({ directory })
    return `${directory}`
  } catch (error) {
    console.error('❌ Error creating directory:', error)
    throw throwError(error, 'Failed to create directory')
  }
}

export const saveFileIntoStorage = async (file: any, dataParams: iHandleFileUpload) => {
  try {
    const { pathUpload, dirName, userId, protocol, host, salesPlatefromId } = dataParams
    const origin: string = `${protocol}://${host}`
    const pipelineAsync = promisify(pipeline)
    const extension: string = path.extname(file.name)
    const newFileName = `${dirName}${Date.now()}${extension}`
    const filePath: string = path.join(pathUpload, newFileName)
    const convertedPath: string = pathUpload.split('\\').join('/')
    if (file instanceof Buffer) {
      await writeFile(filePath, file)
    } else if (file.stream) {
      await pipelineAsync(file.stream(), createWriteStream(filePath))
    } else {
      throw new Error('Unsupported file format')
    }

    const uuidFileKey = uuidv4().replace(/-/g, '')
    console.log({ uuidFileKey })

    const fileUploadObjectCreate: Prisma.FileUploadCreateInput = {
      User: { connect: { id: userId } },
      fileKey: uuidFileKey,
      fileName: newFileName,
      type: file.type,
      size: file.size,
      path: convertedPath,
      url: `${origin}${prefix}/file-system/read/${uuidFileKey}`,
      isPublic: true,
      SalesPlatform: { connect: { id: salesPlatefromId } }
    }

    const { data: createdFileUpload } = await createFileUpload(fileUploadObjectCreate)
    console.log({ createdFileUpload })

    return createdFileUpload
  } catch (error) {
    console.error('Error saving file:', error)
    throw throwError(error, 'saveFileIntoStorage')
  }
}

export const saveFileExcelIntoStorage = async (file: any, dataParams: iHandleFileUpload): Promise<{ checker: boolean; data: any }> => {
  try {
    const { pathUpload, dirName, userId, protocol, host } = dataParams
    const origin: string = `${protocol}://${host}`
    const pipelineAsync = promisify(pipeline)
    const extension: string = path.extname(file.name)
    const newFileName = `${dirName}${Date.now()}${extension}`
    const filePath: string = path.join(pathUpload, newFileName)
    const convertedPath: string = pathUpload.split('\\').join('/')
    if (file instanceof Buffer) {
      await writeFile(filePath, file)
    } else if (file.stream) {
      await pipelineAsync(file.stream(), createWriteStream(filePath))
    } else {
      throw new Error('Unsupported file format')
    }

    const uuidFileKey = uuidv4().replace(/-/g, '')
    const fileAddress: string = `${convertedPath}/${newFileName}`
    const { data: dataPlatform } = await checkFileExcelHeaderTypePlatform(fileAddress)
    const { isValid, detectedPlatform } = dataPlatform as iResDataPlatform
    if (!isValid) {
      await deleteFileFromLocalStorage(fileAddress)
      return { checker: false, data: dataPlatform }
    }

    const { data: findUniqueSalesPlatformData } = await findSalesPlatformUnique({ name: detectedPlatform?.toLocaleUpperCase() })
    const { id: platformId } = findUniqueSalesPlatformData as iResDataPlatform
    const fileUploadObjectCreate: Prisma.FileUploadCreateInput = {
      User: { connect: { id: userId } },
      fileKey: uuidFileKey,
      fileName: newFileName,
      type: file.type,
      size: file.size,
      path: convertedPath,
      url: `${origin}${prefix}/file-system/read/${uuidFileKey}`,
      isPublic: true,
      SalesPlatform: { connect: { id: platformId } }
    }

    const { data: createdFileUpload } = await createFileUpload(fileUploadObjectCreate)
    console.log({ createdFileUpload })

    return { checker: true, data: createdFileUpload }
  } catch (error) {
    console.error('Error saving file:', error)
    throw throwError(error, 'saveFileExcelIntoStorage')
  }
}

export const readFileByFileKey = async (params: iResponseFileUpload) => {
  try {
    console.log('readFile_Controller')
    const { id, fileKey, fileName, type, path, size, url, isPublic } = params
    const filePath: string = `${path}/${fileName}`
    const bunReadFile = Bun.file(filePath)
    const exists = await bunReadFile.exists()
    if (!exists) return { checker: false, data: {} }

    const fileBuffer = Buffer.from(await bunReadFile.arrayBuffer())
    const details = {
      exists: await bunReadFile.exists(),
      size: bunReadFile.size,
      type: bunReadFile.type || 'application/octet-stream',
      lastModified: new Date(bunReadFile.lastModified).toISOString(),
      path: filePath.split('\\').pop(),
      name: fileName
    }
    console.log({ details })

    if (!details.exists) return { checker: false, data: {} }
    return { checker: true, data: { ...details, fileBuffer } }
  } catch (error) {
    throw throwError(error, 'readFileByFileKey')
  }
}
