import winston from 'winston'
import fs from 'fs'
import otpGenerator from 'otp-generator'
import moment from 'moment'

// ================= LOG  ZONE ==================
const dir = './logs/info'
const logPath = `${dir}/${moment().utcOffset('+07:00').format('YYYY-MM-DD')}.log`
const throwDir = './logs/throw'
const throwLogPath = `${throwDir}/${moment().utcOffset('+07:00').format('YYYY-MM-DD')}.log`

const tsFormat = (): string => new Date().toLocaleTimeString()
const mode = process.env.NODE_ENV === 'production'

if (!fs.existsSync(dir)) {
  fs.mkdir(dir, { recursive: true }, err => {
    if (err) console.log('create folder error: ' + err)
  })
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(), // ⬅️ ใช้ `colorize()` ใน format แทน
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: logPath,
      level: 'info',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
})

const throwLogs = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`
    })
  ),
  transports: [
    new winston.transports.File({
      filename: throwLogPath,
      level: 'error',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      level: 'error',
      handleExceptions: true
    })
  ]
})

interface ErrorResponse {
  res_id: string
  res_code: number | string
  res_type?: string
  res_stack?: string
  res_message: string
  res_data: Record<string, unknown>
}

const ErrorFormat = (error: any, res_id: string) => {
  const message = error?.message || error
  const devError: ErrorResponse = {
    res_id,
    res_code: error.status || error.statusCode || 500,
    res_type: 'error',
    res_stack: error.stack,
    res_message: message,
    res_data: {}
  }
  const prodError: ErrorResponse = {
    res_id,
    res_code: '500',
    res_message: 'Server error.',
    res_data: {}
  }
  //   if (mode) {
  //     NotificationErrorService(`ErrorStack -> ${error.stack}`)
  //   }
  return { devError, prodError }
}

const ErrorService = (error: any): ErrorResponse => {
  const res_id = otpGenerator.generate(20)
  const logDateTime = `${moment().utcOffset('+07:00').format('HH:mm:ss:SSS')} +07:00 GMT`
  const { devError, prodError } = ErrorFormat(error, res_id)
  logger.log({
    time: logDateTime,
    level: 'info',
    message: JSON.stringify(devError)
  })
  return mode ? prodError : devError
}

const throwError = (error: any, key: string) => {
  const logDateTime = `${moment().utcOffset('+07:00').format('HH:mm:ss:SSS')} +07:00 GMT`
  const message = error?.message || error
  const stack = error?.stack || 'No stack trace available'
  // throwLogs.log({
  //   time: logDateTime,
  //   level: 'error',
  //   key,
  //   message: JSON.stringify(message)
  // })

  throwLogs.log({
    time: logDateTime,
    level: 'error',
    key,
    message
  })

  throwLogs.log({
    time: logDateTime,
    level: 'error',
    key: `${key}-stack`,
    message: stack
  })
  return error
}

const addErrorApi = (result: Record<string, unknown>) => {
  if (mode) {
    logger.log({
      level: 'info',
      message: JSON.stringify(result)
    })
  }
}

const saveLogService = (logs: string, key: string) => {
  const logDateTime = `${moment().utcOffset('+07:00').format('HH:mm:ss:SSS')} +07:00 GMT`
  throwLogs.log({
    time: logDateTime,
    level: 'error',
    key,
    message: JSON.stringify(logs)
  })
  return logs
}

export { ErrorService, throwError, addErrorApi, saveLogService }
