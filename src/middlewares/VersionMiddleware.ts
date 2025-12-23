import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { iContextStore } from '@/interfaces/Context'
import { setCacheResponse } from '@/controllers/RedisController'
import service from '@/pref/index'
import os from 'os'

export const getVersionAndServerDetail =
  () =>
  async ({ set, store }: Context) => {
    try {
      const { cacheKey } = store as iContextStore
      const { api, version } = service.service
      const hostname = os.hostname()
      const platform = os.platform()
      const architecture = os.arch()
      const totalMemory = os.totalmem()
      const freeMemory = os.freemem()
      const cpus = os.cpus()
      const serverDetail = {
        meta: { api, version },
        system: { hostname, platform, architecture },
        memory: { total: totalMemory, free: freeMemory },
        cpu: { count: cpus.length },
        uptime: os.uptime()
      }
      Object.assign(store, { body: serverDetail })
      await setCacheResponse({ cacheKey, body: serverDetail, timer: 60 })
    } catch (error) {
      throw throwError(error, 'getVersionAndServerDetail')
    }
  }
