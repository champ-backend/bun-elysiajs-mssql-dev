import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { iContextParamsPagination, iContextStore } from '@/interfaces/Context'
import { setCacheResponse } from '@/controllers/RedisController'
import service from '@/pref/index'
import { listsOrderTransactionsPagination } from '@/controllers/OrderTransactionController'
import { createExportHistories } from '@/models/ExportHistories'
import { checkLogsExportTransactions, createLogsExportOrderTransactions, listsExportHistoryPagination } from '@/controllers/ExportHistoriesController'
import { productInStockValidate } from '@/controllers/OrderTransactionValidateController'

export const exportTransactions =
  (data?: any) =>
  async ({ set, store, query }: Context) => {
    try {
      const { paginationParams, information, cacheKey } = store as iContextStore
      const { id: userId } = information
      const { limit, offset, order, sort } = paginationParams as iContextParamsPagination
      const { data: orderTransactions, count } = await listsOrderTransactionsPagination({ limit, offset, order, sort }, query, information)
      const transactions = orderTransactions.map((obj: any) => ({ ...obj, accountCode: obj.accountCode.toString() }))
      if (transactions.length) await createLogsExportOrderTransactions(transactions, userId)
      Object.assign(store, { body: { data: transactions, count } })
    } catch (error) {
      throw throwError(error, 'exportTransactions')
    }
  }

export const listsExportHistories =
  (data?: any) =>
  async ({ store, query }: Context) => {
    try {
      const { paginationParams, information, cacheKey } = store as iContextStore
      const { limit, offset, order, sort } = paginationParams as iContextParamsPagination
      const { data, count } = await listsExportHistoryPagination({ limit, offset, order, sort }, query, information)
      Object.assign(store, { body: { data, count } })
      await setCacheResponse({ cacheKey, body: { data, count }, timer: 15 })
    } catch (error) {
      throw throwError(error, 'listsExportHistories')
    }
  }

export const historyRecordChecking =
  (data?: any) =>
  async ({ store }: Context) => {
    try {
      const { record } = store as { record: number[] }
      const { data: recordTransactions } = await checkLogsExportTransactions(record)
      Object.assign(store, { body: { data: recordTransactions } })
    } catch (error) {
      throw throwError(error, 'historyRecordChecking')
    }
  }

export const dataWarehouseNotificationTest =
  (data?: any) =>
  async ({ store, query }: Context) => {
    try {
      const { data: dataStock } = await productInStockValidate([], query)
      Object.assign(store, { body: dataStock })
    } catch (error) {
      throw throwError(error, 'dataWarehouseNotificationTest')
    }
  }
