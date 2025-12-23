import { Elysia } from 'elysia'
import { cron, Patterns } from '@elysiajs/cron'

export function setupCronJobs(app: Elysia) {
  // app.use(
  //   cron({
  //     name: 'heartbeat1',
  //     pattern: '*/1 * * * * *',
  //     run() {
  //       const timestamp = new Date().toISOString()
  //       console.log(`[${timestamp}] Heartbeat Job 1 executed.`)
  //     }
  //   })
  // )

  app.use(
    cron({
      name: 'dailyTask',
      pattern: '0 0 * * *', // รันทุกวันเวลา 00:00
      run() {
        console.log(`[${new Date().toISOString()}] Running daily task`)
      }
    })
  )
  // app.use(
  //   cron({
  //     name: 'hourlyTask',
  //     pattern: '0 * * * *', // รันทุกชั่วโมง
  //     run() {
  //       console.log(`[${new Date().toISOString()}] Running hourly task`)
  //     }
  //   })
  // )

  //test patterns EVERY_2_HOURS
  app.use(
    cron({
      name: 'EVERY_2_HOURS',
      pattern: Patterns.EVERY_2_HOURS,
      run() {
        console.log(`[${new Date().toISOString()}] Patterns Running EVERY_2_HOURS task`)
      }
    })
  )
}
