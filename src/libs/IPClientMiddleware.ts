import { Elysia } from 'elysia'
import { ip } from 'elysia-ip'

const ipClientHandler = (app: Elysia) => {
  return app.use(ip()).derive(({ request, store, ip }) => {
    const clientIp = resolveClientIp(request, ip || '0.0.0.0')
    store.clientIp = clientIp
  })
}

function resolveClientIp(request: Request, fallbackIp: string): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0].trim() || realIp || fallbackIp
}

export default ipClientHandler
