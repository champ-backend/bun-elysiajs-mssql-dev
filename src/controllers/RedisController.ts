import { throwError } from '@/libs/ErrorService'
import crypto from 'crypto'
import caching from '@/libs/Redis'
import { iCacheParams } from '@/interfaces/Redis'

export const generateCacheKey = async (username: string, method: string, url: string, params: Record<string, any> = {}, query: Record<string, any> = {}) => {
  const sortedParams = JSON.stringify(
    Object.keys(params)
      .sort()
      .reduce((acc: Record<string, any>, key: string) => {
        acc[key] = params[key]
        return acc
      }, {})
  )

  const sortedQuery = JSON.stringify(
    Object.keys(query)
      .sort()
      .reduce((acc: Record<string, any>, key: string) => {
        acc[key] = query[key]
        return acc
      }, {})
  )

  const rawKey = `${username}${method}:${url}:${sortedParams}:${sortedQuery}`
  return crypto.createHash('md5').update(rawKey).digest('hex')
}

export const setCacheResponse = async ({ cacheKey, body, timer = 10 }: iCacheParams) => {
  try {
    const client = caching.getClient()
    if (body !== null && body !== undefined) {
      await client.setEx(cacheKey, timer, JSON.stringify(body))
    }
  } catch (error) {
    throw throwError(error, 'setCacheResponse')
  }
}
