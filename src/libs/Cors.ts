import { cors } from '@elysiajs/cors'
import config from '@/pref/index'

export function corePlugin() {
  return cors({
    origin: config.service.allow.origin,
    methods: config.service.allow.method,
    credentials: config.service.allow.credential,
    allowedHeaders: config.service.allow.header
  })
}
