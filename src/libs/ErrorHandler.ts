import { ErrorHandler } from 'elysia'
import { responseFormat } from '@/libs/ResponseFormatter'
import chalk from 'chalk'

const methodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'GET':
      return chalk.white(method)
    case 'POST':
      return chalk.yellow(method)
    case 'PUT':
      return chalk.cyan(method)
    case 'PATCH':
      return chalk.magenta(method)
    case 'DELETE':
      return chalk.red(method)
    default:
      return chalk.white(method)
  }
}

export const errorHandler: ErrorHandler = context => {
  if (!context) {
    console.error(chalk.red('❌ Error: context is undefined'))
    return responseFormat({}, 'UNKNOWN_ERROR', 'EN')
  }
  const { code, error, set, request } = context
  const method = request.method
  const url = new URL(request.url).pathname
  const status = code === 'NOT_FOUND' ? 404 : 500
  set.status = status
  set.headers['Content-Type'] = 'application/json'

  console.log(chalk.red(' <-- ') + chalk.bold(methodColor(method)) + chalk.gray(` ${url}`) + chalk.red(` ${status}`))
  if (code === 'NOT_FOUND') {
    return responseFormat({ champ: 'แตกจ้า-> 555' }, 'PAGE_NOT_FOUND', 'EN')
  }

  return responseFormat({}, 'SERVER_ERROR', 'EN')
}
