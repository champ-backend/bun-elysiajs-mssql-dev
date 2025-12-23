import type { Handler } from 'elysia'
import { responseFormat } from '@/libs/ResponseFormatter'

export const notFoundHandler: Handler = ({ request, set }) => {
  set.status = 404
  set.headers['Content-Type'] = 'application/json'
  const responseMessage = {
    method: request.method,
    path: new URL(request.url).pathname
  }
  return responseFormat(responseMessage, 'PAGE_NOT_FOUND', 'EN')
}
