import { SwaggerConfig } from '@/interfaces/Swagger'

const swagger: { document: SwaggerConfig } = {
  document: {
    path: '/api/v1/swagger',
    provider: 'swagger-ui',
    documentation: {
      info: {
        title: 'ELYSIAJS API DOCUMENT FTAI',
        version: '1.0.0'
      }
    }
  }
}

export default swagger
