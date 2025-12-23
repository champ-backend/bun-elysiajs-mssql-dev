import { Elysia } from 'elysia'
import { responseFormat } from '@/libs/ResponseFormatter'
import { basicAuthentication, tokenAuthentication } from '@/middlewares/AuthenticationMiddleware'
import { xPlatformValidate } from '@/validations/AuthenticationValidate'
import config from '@/pref/index'
import { iContextStore } from '@/interfaces/Context'
import { handleCaching, cachingMiddlewareTest } from '@/middlewares/RedisMiddleware'
import { getVersionAndServerDetail } from '@/middlewares/VersionMiddleware'
const prefix: string = config.service.api
const pathname: string = `${prefix}/basic`

export const BasicRoutes = new Elysia().group(`${pathname}`, Routes =>
  Routes.guard({ beforeHandle: [basicAuthentication(), xPlatformValidate(), tokenAuthentication()] }, group =>
    group
      .get(
        '/version',
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'GET_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [handleCaching(), getVersionAndServerDetail()]
        }
      )
      .get(
        '/caching',
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'GET_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [handleCaching(), cachingMiddlewareTest('test')]
        }
      )
  )
)
