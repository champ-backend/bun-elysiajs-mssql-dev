export interface SwaggerConfig {
  path: string
  provider: 'scalar' | 'swagger-ui' | undefined
  documentation: {
    info: {
      title: string
      version: string
    }
  }
}
