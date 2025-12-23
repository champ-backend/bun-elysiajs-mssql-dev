import { swagger } from '@elysiajs/swagger'
import config from '@/pref/Swagger'

export function swaggerPlugin() {
  return swagger({
    path: config.document.path,
    provider: config.document.provider,
    documentation: {
      info: {
        title: config.document.documentation.info.title,
        version: config.document.documentation.info.version
      }
    }
  })
}
