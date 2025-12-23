import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { readFileByFileKey, saveFileExcelIntoStorage, saveFileIntoStorage } from '@/controllers/FileSystemController'
import { iContextStoreFileSystem, iHandleFileUpload } from '@/interfaces/FileSystem'
import { iContextStore } from '@/interfaces/Context'
import { responseFormat } from '@/libs/ResponseFormatter'

export const handleFileUpload =
  (data?: string[]) =>
  async ({ store }: Context) => {
    try {
      console.log('✅ handle file upload')
      const { files, pathUpload, dir, information, protocol, host, salesPlatefromId } = store as iContextStoreFileSystem
      const objectCreateFile: iHandleFileUpload = { pathUpload, dirName: dir, userId: information.id, protocol, host, salesPlatefromId }
      const createdFiles = await Promise.all(files.map(file => saveFileIntoStorage(file, objectCreateFile)))
      Object.assign(store, { created: createdFiles })
    } catch (error) {
      throw throwError(error, 'handleFileUpload')
    }
  }

export const handleFileExcelUpload =
  (data?: string[]) =>
  async ({ store }: Context) => {
    try {
      const { files, pathUpload, dir, information, protocol, host, language } = store as iContextStoreFileSystem
      const objectCreateFile: iHandleFileUpload = { pathUpload, dirName: dir, userId: information.id, protocol, host }
      const [{ checker, data: createdFiles }] = await Promise.all(files.map(file => saveFileExcelIntoStorage(file, objectCreateFile)))
      if (!checker) return responseFormat({}, 'FILE_EXCEL_TYPE_PLATFORM_NOT_ALLOW', language)
      Object.assign(store, { created: createdFiles })
    } catch (error) {
      throw throwError(error, 'handleFileExcelUpload')
    }
  }

export const readFileSystem =
  (data?: string[]) =>
  async ({ store }: Context) => {
    try {
      const { fileUpload, language } = store as iContextStore
      const { checker, data } = await readFileByFileKey(fileUpload)
      if (!checker) return responseFormat({}, 'GET_DATA_NOT_FOUND', language)
      Object.assign(store, { result: data })
    } catch (error) {
      throw throwError(error, 'readFileSystem')
    }
  }
