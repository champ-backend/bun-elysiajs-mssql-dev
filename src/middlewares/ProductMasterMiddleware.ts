import { listsProductMaster } from '@/controllers/ProductMasterController'
import { setCacheResponse } from '@/controllers/RedisController'
import { iContextParamsPagination, iContextStore } from '@/interfaces/Context'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { Context } from 'elysia'
import { Result } from 'tedious/lib/token/helpers'

export const handleSelectProductMaster =
  (data?: string[]) =>
  async ({ store, query }: Context) => {
    try {
      const { language } = store as iContextStore
      const { paginationParams, cacheKey } = store as iContextStore
      const { limit, offset, order, sort } = paginationParams as iContextParamsPagination
      const { checker, message, data, count } = await listsProductMaster({ limit, offset, order, sort }, query)
      if (!checker) return responseFormat({}, message, language)
      Object.assign(store, { body: { data, count } })
      await setCacheResponse({ cacheKey, body: { data, count }, timer: 15 })
    } catch (error) {
      throw throwError(error, 'handleSelectProductMaster')
    }
  }
