export interface iRedisConfig {
  url?: string
  host?: string
  port?: number
}

export interface iRedisCaching {
  key?: string
  value?: string
  timer?: number
}

export interface iCacheParams {
  cacheKey: string
  body: any
  timer?: number
}
