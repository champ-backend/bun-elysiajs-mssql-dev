import { rateLimit } from 'elysia-rate-limit'
import envConfig from 'config'
import moment from 'moment'

interface iRateLimit {
  duration: number
  maxIps: number
  headers: boolean
  scoping: 'global' | 'scoped'
  countFailedRequest: boolean
}

const { duration, maxIps, headers, scoping, countFailedRequest } = envConfig.get<iRateLimit>('rateLimit')

export function rateLimitPlugin() {
  return rateLimit({
    duration,
    max: maxIps,
    headers: headers,
    scoping: scoping,
    countFailedRequest: countFailedRequest,
    errorResponse: new Response(
      JSON.stringify({
        res_code: 429,
        res_type: 'error',
        res_message: 'Too Many Requests.',
        res_data: {},
        res_time: moment().format()
      }),
      {
        status: 429,
        headers: new Headers({
          'Content-Type': 'application/json',
          'Retry-After': `${duration / 1000}`
        })
      }
    )
  })
}
