import { Elysia } from 'elysia'
import moment from 'moment'
import bytes from 'bytes'
import chalk from 'chalk'

let startTime = 0
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown Error'
}

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

const loggingHandler = (app: Elysia) => {
  return app
    .onRequest(({ request, store }) => {
      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
      const method = request.method
      const url = new URL(request.url).pathname
      startTime = performance.now()
      console.log(chalk.blue(' --> ') + chalk.bold(methodColor(method)) + chalk.gray(` ${url}`) + ' ' + chalk.cyan(timestamp) + ' ' + chalk.gray('+7:00 TH'))
    })
    .onAfterHandle(async ({ request, response, set, store }) => {
      const method = request.method
      const url = new URL(request.url).pathname
      const status = Number(set.status) || 200
      const responseSize = bytes(JSON.stringify(response).length)
      const durationMs = (performance.now() - startTime).toFixed(2)
      let statusColor = chalk.green
      if (status >= 400 && status < 500) {
        statusColor = chalk.yellow
      } else if (status >= 500) {
        statusColor = chalk.red
      }
      console.log(chalk.green(' <-- ') + chalk.bold(methodColor(method)) + chalk.gray(` ${url}`) + statusColor(` ${status}`) + chalk.gray(` ${responseSize}`) + chalk.cyan(` ${durationMs}ms`))
    })
    .onError(({ request, error, set, store, code }) => {
      console.log({ code })
      const method = request.method
      const url = new URL(request.url).pathname
      set.status = 404
      const status = Number(set.status)
      const errorMessage = getErrorMessage(error)
      const durationMs = (performance.now() - startTime).toFixed(2)
      console.log(chalk.red(' <-- ') + chalk.bold(methodColor(method)) + chalk.gray(` ${url}`) + chalk.red(` ${status}`) + chalk.cyan(` ${durationMs}ms`))
    })
}

export default loggingHandler
