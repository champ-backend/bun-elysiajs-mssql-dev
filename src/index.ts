import { Elysia } from 'elysia'
import { helmet } from 'elysia-helmet'
import chalk from 'chalk'
import config from 'config'
import { BasicRoutes } from '@/routes/BasicRoutes'
import { UserRoutes } from '@/routes/UserRoutes'
import { FileSystemRoutes } from '@/routes/FileSystemRoutes'
import { createEnvironmentVariables } from '@/libs/ENV'
import { rateLimitPlugin } from '@/libs/RateLimit'
import { swaggerPlugin } from '@/libs/Swagger'
import { corePlugin } from '@/libs/Cors'
import { errorHandler } from '@/libs/ErrorHandler'
import { setupCronJobs } from '@/libs/Cron'
import { iServer } from '@/interfaces/Config'
import { initializeDatabase } from '@/controllers/ORMController'
import { masterDataCreate } from '@/models/MasterDataCreate'
import { OrderTransactionRoutes } from '@/routes/OrderTransaction'
import chaching from '@/libs/Redis'
import { AdminRoutes } from '@/routes/AdminRoutes'
import { notFoundHandler } from '@/libs/NotFoundHandler'
import loggingHandler from '@/libs/Logger'
import ipClientHandler from '@/libs/IPClientMiddleware'
import { ExportHistoriesRoutes } from '@/routes/ExportHistoriesRoutes'
import { WarehouseRoutes } from '@/routes/WarehouseRoutes'

const server = config.get<iServer>('server')
const app = new Elysia({ serve: { maxRequestBodySize: server.maxRequestSize } })

createEnvironmentVariables()
chaching.flushAllRedis()
initializeDatabase()
masterDataCreate()
setupCronJobs(app)

app.onError(context => errorHandler(context))
app.use(corePlugin())
app.use(helmet())
app.use(rateLimitPlugin())
app.use(swaggerPlugin())
app.use(loggingHandler)
app.use(ipClientHandler)

app.use(BasicRoutes)
app.use(UserRoutes)
app.use(AdminRoutes)
app.use(FileSystemRoutes)
app.use(OrderTransactionRoutes)
app.use(ExportHistoriesRoutes)
app.use(WarehouseRoutes)
app.all('*', notFoundHandler)

const portPrefix: number = Number(process.env.SERVER_PORT_ENV) || server.port
const portUsed: number = portPrefix + (parseInt(process.env.NODE_APP_INSTANCE || '0', 10) || 0)
app.listen(Number(process.env.SERVER_PORT_ENV) || portUsed, () => {
  console.log(`===================================================
🦊 Elysia Server: ${chalk.cyan(server.host)}:${chalk.cyan(portUsed)}
🌎 Deploy Mode: ${chalk.yellow(process.env.NODE_ENV)}
😊 PM2 instance: ${chalk.gray(process.env.NODE_APP_INSTANCE || 'master')}
🚀 Max Request Body Size:${chalk.red(server.maxRequestSize / 1048576)} MB
===================================================`)
})
