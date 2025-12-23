import { throwError } from '@/libs/ErrorService'
import { upsertProductMasterUnique } from '@/models/ProductMaster'
import chunk from 'lodash.chunk'
import pLimit from 'p-limit'

export const batchUpsertProductMaster = async (productMasterData: any[], batchSize: number = 1000, concurrency: number = 50) => {
  try {
    const results: any[] = []
    const chunks = chunk(productMasterData, batchSize)
    const limit = pLimit(concurrency)
    for (const group of chunks) {
      const batchResults = await Promise.all(
        group.map(order =>
          limit(async () => {
            const { material } = order
            const where = { material }
            const createObject = { ...order }
            const updateObject = { ...order }
            const { data } = await upsertProductMasterUnique(where, createObject, updateObject)
            console.log({ data })
            return data
          })
        )
      )
      results.push(...batchResults)
      console.log(`Imported batch of ${batchResults.length} records`)
    }
    return results
  } catch (error) {
    throw throwError(error, 'batchUpsertProductMaster')
  }
}
