import { Elysia } from 'elysia'
import { responseFormat } from '@/libs/ResponseFormatter'
import { basicAuthentication, tokenAuthentication } from '@/middlewares/AuthenticationMiddleware'
import { xPlatformValidate } from '@/validations/AuthenticationValidate'
import { readFilesValidate, uploadFileExcelValidate, uploadFilesValidate } from '@/validations/FileSystemValidate'
import { handleFileExcelUpload, handleFileUpload, readFileSystem } from '@/middlewares/FileSystemMiddleware'
import { iContextStore } from '@/interfaces/Context'
import config from '@/pref/index'
import { iFileResultResponse } from '@/interfaces/FileSystem'

const prefix: string = config.service.api
const pathname: string = `${prefix}/file-system`

export const FileSystemRoutes = new Elysia()
  .group(`${pathname}`, Routes =>
    Routes.guard({ beforeHandle: [basicAuthentication(), xPlatformValidate(), tokenAuthentication()] }, group =>
      group
        .get('/:id', ({ set, store }) => {
          const { language } = store as iContextStore
          set.status = 200
          return responseFormat({}, 'GET_DATA_SUCCESS', language)
        })
        .put('/update/:id', ({ set, store }) => {
          const { language } = store as iContextStore
          set.status = 200
          return responseFormat({}, 'UPDATE_DATA_SUCCESS', language)
        })
        .delete('/delete/:id', ({ set, store }) => {
          const { language } = store as iContextStore
          set.status = 200
          return responseFormat({}, 'DELETE_DATA_SUCCESS', language)
        })
        .post(
          `/upload/excel`,
          ({ set, store }) => {
            const { language, created } = store as iContextStore
            set.status = 200
            return responseFormat(created, 'POST_DATA_SUCCESS', language)
          },
          { beforeHandle: [uploadFileExcelValidate(), handleFileExcelUpload()] }
        )
    )
  )
  .post(
    `${pathname}/upload`,
    ({ set, store }) => {
      const { language, created } = store as iContextStore
      set.status = 200
      return responseFormat(created, 'POST_DATA_SUCCESS', language)
    },
    { beforeHandle: [basicAuthentication(), xPlatformValidate(), tokenAuthentication(), uploadFilesValidate(), handleFileUpload()] }
  )
  .get(
    `${pathname}/read/:fileKey`,
    ({ set, store }) => {
      const { result } = store as iContextStore
      const { type, fileBuffer, name } = result as iFileResultResponse
      set.status = 200
      set.headers['Content-Type'] = type
      // set.headers['Content-Disposition'] = `attachment; filename="${name}"` //download file
      return new Response(fileBuffer)
    },
    { beforeHandle: [readFilesValidate(), readFileSystem()] }
  )
