import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { iContextStore } from '@/interfaces/Context'
import caching from '@/libs/Redis'
import { generateCacheKey, setCacheResponse } from '@/controllers/RedisController'

export const handleCaching =
  (data?: string[]) =>
  async ({ set, store, params, request, query }: Context) => {
    try {
      const { method, url } = request
      const { language, information } = (store as iContextStore) || {}
      const { username } = information
      const cacheKey = await generateCacheKey(username, method, url, params, query)
      Object.assign(store, { cacheKey })
      const client = caching.getClient()
      const cachedResponse = await client.get(cacheKey)
      if (cachedResponse !== null) return responseFormat(JSON.parse(cachedResponse), 'GET_DATA_SUCCESS', language)
    } catch (error) {
      throw throwError(error, 'handleCaching')
    }
  }

export const cachingMiddlewareTest =
  (data?: string) =>
  async ({ set, store, params, request, query }: Context) => {
    try {
      const { cacheKey } = store as iContextStore
      Object.assign(store, { body: [1, 2, 3, 4, 5] })
      await setCacheResponse({ cacheKey, body: [1, 2, 3, 4, 5], timer: 15 })
    } catch (error) {
      throw throwError(error, 'cachingMiddlewareTest')
    }
  }
