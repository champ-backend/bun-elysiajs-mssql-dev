import moment from 'moment'
import config from 'config'
import { createClient, RedisClientType } from 'redis'
import chalk from 'chalk'
import { iRedisConfig } from '@/interfaces/Redis'

const { url, host, port } = config.get<iRedisConfig>('redis') || {}
const client: RedisClientType = process.env.REDIS_HOST ? createClient({ url: `${process.env.REDIS_HOST}` }) : url && url !== '' ? createClient({ url }) : createClient({ socket: { host, port } })
client.on('error', (err: Error) => {
  console.log(chalk.red(`❌${moment.utc().format('YYYY-MM-DD HH:mm:ss')} UTC+00:00 Redis error: ${err.message}`))
})
;(async () => {
  try {
    await client.connect()
    console.log(chalk.green('✅ Redis client connected successfully!'))
  } catch (error) {
    console.log(chalk.red('❌Failed to connect to Redis: ' + error))
  }
})()

class Caching {
  getClient(): RedisClientType {
    return client
  }

  async setCache(key: string, value: string, timer = 10800): Promise<void> {
    await client.setEx(key, timer, value)
  }

  async setCacheExpireNone(key: string, value: string): Promise<void> {
    await client.set(key, value)
  }

  async deleteCache(key: string): Promise<void> {
    await client.del(key)
  }

  async getCache(key: string): Promise<string | null> {
    return await client.get(key)
  }

  async flushAllRedis(): Promise<void> {
    console.log('----> Flush all redis keys is: success!!')
    await client.flushDb()
  }
}

export default new Caching()
