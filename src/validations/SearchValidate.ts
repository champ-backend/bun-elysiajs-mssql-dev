import { iContextParamsPagination, iContextStore } from '@/interfaces/Context'
import { throwError } from '@/libs/ErrorService'
import { extractMessagesAsync } from '@/libs/ExtractMessage'
import { responseFormat } from '@/libs/ResponseFormatter'
import { Context } from 'elysia'
import { z as bodySchema } from 'zod'
import moment from 'moment'

export const checkParamsPagination =
  (data?: string[]) =>
  async ({ store, params, set }: Context) => {
    try {
      const { language } = store as iContextStore
      const { order, sort } = params
      const allowedOrderTypes = ['createdAt', 'updatedAt', 'invoiceDate'] as const
      const allowedSortTypes = ['ASC', 'DESC'] as const
      const paramsSchema = bodySchema.object({
        limit: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(1, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(11, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^\d+$/, { message: 'REQUIRED_ONLY_POSITIVE_NUMBER' }),
        offset: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(1, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(11, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^\d+$/, { message: 'REQUIRED_ONLY_POSITIVE_NUMBER' }),
        order: bodySchema.enum(allowedOrderTypes),
        sort: bodySchema.enum(allowedSortTypes)
      })

      const validation = paramsSchema.safeParse(params)
      if (!validation.success) {
        const errors = validation.error.format()
        console.log({ errors })
        if (errors.order?._errors?.length) return responseFormat({ error: `order should be one of ${allowedOrderTypes.join(', ')}` }, 'ORDER_IS_NOT_ALLOW', language)
        if (errors.sort?._errors?.length) return responseFormat({ error: `sort should be one of ${allowedSortTypes.join(', ')}` }, 'INVALID_SORT_VALUE', language)
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      const limit = parseInt(params.limit, 10)
      const offset = parseInt(params.offset, 10)

      if (limit <= 0) {
        set.status = 400
        return responseFormat({}, 'LIMIT_MUST_BE_POSITIVE_NUMBER', language)
      }

      if (offset <= 0) {
        set.status = 400
        return responseFormat({}, 'OFFSET_MUST_BE_POSITIVE_NUMBER', language)
      }

      const formattedParams: iContextParamsPagination = { limit, offset, order, sort }
      Object.assign(store, { paginationParams: formattedParams })
    } catch (error) {
      throw throwError(error, 'checkParamsPagination')
    }
  }

export const checkQueryDateAndTime =
  (data?: string[]) =>
  async ({ store, query, set }: Context) => {
    try {
      const { language } = store as iContextStore
      const strictIsoDateSchema = bodySchema
        .string({ message: 'REQUIRED_ONLY_STRING' })
        .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
        .refine(value => moment(value, moment.ISO_8601, true).isValid(), { message: 'INVALID_DATE_FORMAT' })

      const validationSchema = bodySchema.object({
        searchStart: strictIsoDateSchema.optional(),
        searchEnd: strictIsoDateSchema.optional()
      })

      const validation = validationSchema.safeParse(query)
      if (!validation.success) {
        const errors = validation.error.format()
        if (errors.searchStart?._errors?.length) return responseFormat({ error: `searchStart: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        if (errors.searchEnd?._errors?.length) return responseFormat({ error: `searchEnd: 'YYYY-MM-DDTHH:mm:ss.sssZ'` }, 'INVALID_DATE_FORMAT', language)
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        set.status = 400
        return responseFormat(keyErrors, errorMessage[0], language)
      }
    } catch (error) {
      throw throwError(error, 'checkQueryDateAndTime')
    }
  }

export const checkSearchParamsById =
  () =>
  async ({ store, params, set }: Context) => {
    try {
      const { language } = store as iContextStore
      const { id } = params
      const paramsSchema = bodySchema.object({
        id: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(1, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(10, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^\d+$/, { message: 'REQUIRED_ONLY_POSITIVE_NUMBER' })
      })

      const validation = paramsSchema.safeParse(params)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      Object.assign(store, { id: parseInt(id, 10) })
    } catch (error) {
      throw throwError(error, 'checkSearchParamsById')
    }
  }
