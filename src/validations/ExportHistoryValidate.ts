import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { iContextBodyCheckHistoryRecord, iContextStore } from '@/interfaces/Context'
import { z as bodySchema } from 'zod'

export const checkHistoryRecordValidate =
  (data?: string[]) =>
  async ({ request, set, store, body }: Context) => {
    try {
      const { language } = store as iContextStore
      const { record } = body as iContextBodyCheckHistoryRecord
      const schema = bodySchema.object({ record: bodySchema.array(bodySchema.number()).min(1) })
      const validation = schema.safeParse({ record })
      if (!validation.success) {
        const errors = validation.error.format()
        const { _errors, ...errResponse } = errors
        return responseFormat(errResponse, 'DATA_VALIDATION_ERROR', language)
      }
      Object.assign(store, { record: validation.data.record })
    } catch (error) {
      throw throwError(error, 'checkHistoryRecordValidate')
    }
  }
