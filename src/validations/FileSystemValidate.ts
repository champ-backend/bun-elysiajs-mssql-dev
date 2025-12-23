import config from 'config'
import { Context } from 'elysia'
import { autoCreateDirectory } from '@/controllers/FileSystemController'
import { z as bodySchema } from 'zod'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { extractMessagesAsync } from '@/libs/ExtractMessage'
import { iContextBody, iContextStore } from '@/interfaces/Context'
import { iFileSystem } from '@/interfaces/FileSystem'
import { findFileUploadUnique } from '@/models/FileSystem'
import { salesPlatform as keySalesPlatform } from '@/seeders/seeder'
import { findSalesPlatformUnique } from '@/models/SalesPlatform'

const { type: fileTypeAllow, directoryPath, limit: fileLimit, filename } = config.get<iFileSystem>('fileSystem')

export const uploadFilesValidate =
  (data?: string[]) =>
  async ({ set, store, body }: Context) => {
    try {
      const { language, information } = (store || {}) as iContextStore
      const dirStoreName = information.username.split('@')[0]
      const pathDirUpload = await autoCreateDirectory(directoryPath, `/${dirStoreName}`)
      let { upload, salesPlatform } = body as iContextBody
      console.log({ body })

      if (!Array.isArray(upload)) upload = [upload]
      const fileSchema = bodySchema.object({
        upload: bodySchema
          .array(
            bodySchema.object({
              name: bodySchema.string(),
              type: bodySchema.string().refine(type => fileTypeAllow.includes(type), { message: 'INVALID_FILE_TYPE' }),
              size: bodySchema.number().max(fileLimit, { message: 'FILE_SIZE_EXCEEDED' })
            })
          )
          .min(1, { message: 'MISSING_REQUIRED_FILE' })
      })

      const validation = fileSchema.safeParse({ upload })
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        if (!keyErrors.length) return responseFormat({ body: 'form-data', upload: 'File' }, 'MISSING_REQUIRED_FILES', language)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      if (salesPlatform) {
        const platformsAllow = keySalesPlatform.map(platform => platform.name)
        const isSalesPlatformValid = platformsAllow.includes(salesPlatform.toUpperCase())
        if (!isSalesPlatformValid) {
          set.status = 400
          return responseFormat({ param: `x-platform = ${platformsAllow}` }, 'INVALID_VALUES', language)
        }
        const { data: findUniqueSalesPlatformData } = await findSalesPlatformUnique({ name: salesPlatform })
        console.log({ findUniqueSalesPlatformData })
        if (!findUniqueSalesPlatformData) return responseFormat({ name: salesPlatform }, 'INVALID_VALUES', language)
        Object.assign(store, { salesPlatefromId: findUniqueSalesPlatformData.id })
      }

      Object.assign(store, { files: upload, pathUpload: pathDirUpload, dir: filename })
    } catch (error) {
      throw throwError(error, 'uploadFilesValidate')
    }
  }

export const readFilesValidate =
  (data?: string[]) =>
  async ({ store, body, params }: Context) => {
    try {
      const { fileKey } = params
      const { language } = store as iContextStore
      const uuidSchema = bodySchema.object({
        fileKey: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(30, { message: 'MISSING_REQUIRED_VALUES' })
          .max(40, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z0-9]+$/, { message: 'INVALID_UUID' })
      })

      const validation = uuidSchema.safeParse({ fileKey })
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      const { data: findUniqueFileUpload } = await findFileUploadUnique({ fileKey: fileKey })
      console.log({ findUniqueFileUpload })

      if (!findUniqueFileUpload) return responseFormat({ fileKey: fileKey }, 'GET_DATA_NOT_FOUND', language)
      Object.assign(store, { fileUpload: findUniqueFileUpload })
    } catch (error) {
      throw throwError(error, 'readFileValidate')
    }
  }

export const uploadFileExcelValidate =
  (data?: string[]) =>
  async ({ set, store, body }: Context) => {
    try {
      const { language, information } = (store || {}) as iContextStore
      const dirStoreName = information.username.split('@')[0]
      const pathDirUpload = await autoCreateDirectory(directoryPath, `/${dirStoreName}`)
      let { upload, salesPlatform } = body as iContextBody

      if (!Array.isArray(upload)) upload = [upload]
      const fileSchema = bodySchema.object({
        upload: bodySchema
          .array(
            bodySchema.object({
              name: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }),
              type: bodySchema.string({ message: 'REQUIRED_ONLY_STRING' }).refine(type => fileTypeAllow.includes(type), { message: 'INVALID_FILE_TYPE' }),
              size: bodySchema.number().max(fileLimit, { message: 'FILE_SIZE_EXCEEDED' })
            })
          )
          .min(1, { message: 'MISSING_REQUIRED_FILE' })
      })

      const validation = fileSchema.safeParse({ upload })
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        if (!keyErrors.length) return responseFormat({ body: 'form-data', upload: 'File' }, 'MISSING_REQUIRED_FILES', language)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      Object.assign(store, { files: upload, pathUpload: pathDirUpload, dir: filename })
    } catch (error) {
      throw throwError(error, 'uploadFileExcelValidate')
    }
  }
