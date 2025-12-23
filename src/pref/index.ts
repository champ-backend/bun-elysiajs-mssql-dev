interface ServiceConfig {
  api: string
  version: string
  allow: {
    origin: string[]
    method: string[]
    header: string[]
    credential: boolean
  }
}

const config: { service: ServiceConfig } = {
  service: {
    api: '/api/v1',
    version: '1.0.0',
    allow: {
      origin: ['*'],
      method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      header: ['Origin', 'Accept', 'Accept-Version', 'Content-Length', 'Content-Type', 'Date', 'X-Response-Time', 'Authorization', 'x-access-token', 'x-platform'],
      credential: true // Allow cookies & authentication headers
    }
  }
}

export default config
