import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { iContextStore } from '@/interfaces/Context'

export const xPlatformValidate =
  (data?: string[]) =>
  async ({ request, set, store }: Context) => {
    try {
      const { language } = store as iContextStore
      const platform = request.headers.get('x-platform') || ''
      if (!platform) {
        set.status = 400
        return responseFormat({}, 'HEADER_REQUIRED_PLATFORM', language)
      }

      const platforms = ['WEB', 'MOBILE', 'SOCKET']
      const isPlatformValid = platforms.includes(platform.toUpperCase())

      if (!isPlatformValid) {
        set.status = 400
        return responseFormat({ param: `x-platform = ['WEB', 'MOBILE', 'SOCKET']` }, 'INVALID_VALUES', language)
      }
      Object.assign(store, { platform: platform.toUpperCase() })
    } catch (error) {
      throw throwError(error, 'xPlatformValidate')
    }
  }
