import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { coreProcessCheckDuplicateShopeeOrder, coreProcessCreateShopeeOrder, deleteShopeeOrderTransaction, updateShopeeOrderTransaction } from '@/controllers/ShopeeOrderController'
import { iContextParamsPagination, iContextStore } from '@/interfaces/Context'
import { coreProcessCheckDuplicateShopifyOrder, coreProcessCreateShopifyOrder, deleteShopifyOrderTransaction, updateShopifyOrderTransaction } from '@/controllers/ShopifyOrderController'
import { iResponseFileUpload } from '@/interfaces/FileSystem'
import { coreProcessCreateLazadaOrder } from '@/controllers/LazadaOrderController'
import { salesPlatform } from '@/seeders/seeder'
import { listsOrderTransactionsPagination } from '@/controllers/OrderTransactionController'
import { setCacheResponse } from '@/controllers/RedisController'
import { platformUpdateOrderTransaction } from '@/pref/PlatformOnly'
import { filterAllowedFields } from '@/libs/Filter'
import { coreProcessCreateProductMaster, updateProductMaster } from '@/controllers/ProductMasterController'
import { iBodyOrderTransactionCreate } from '@/interfaces/OrderTransaction'
import { platformUpdateProductMaster } from '@/pref/ProductMaster'
import { coreProcessCheckDuplicateTiktokOrder, coreProcessCreateTiktokOrderMiddleware } from '@/controllers/TiktokController'

export const handleCreateOrderTransaction =
  (data?: string[]) =>
  async ({ store, body, set }: Context) => {
    try {
      const { accountCode, salesmanCode, plant, storageLocation, country } = body as iBodyOrderTransactionCreate
      const { language, information, fileUpload: objectFileUpload } = store as iContextStore
      const { SalesPlatform } = objectFileUpload as iResponseFileUpload
      const platform = SalesPlatform?.name as string
      if (!salesPlatform.map(platform => platform.name).includes(platform)) {
        throw new Error(`Invalid or missing platform: ${platform}`)
      }

      const coreProcessCreateOrder = platform === 'SHOPEE' ? coreProcessCreateShopeeOrder : platform === 'SHOPIFY' ? coreProcessCreateShopifyOrder : coreProcessCreateTiktokOrderMiddleware
      const { checker, message, data, errors } = await coreProcessCreateOrder(objectFileUpload, information.id, { accountCode, salesmanCode, plant, storageLocation, country })
      if (!checker) return responseFormat(data, message, language)
      const formattedOrderTransactions = data?.map((obj: any) => ({ ...obj, accountCode: obj.accountCode.toString(), taxId: obj.taxId?.toString() }))
      Object.assign(store, { body: { data: formattedOrderTransactions, errors } })
    } catch (error) {
      throw throwError(error, 'handleCreateOrderTransaction')
    }
  }

export const handleListsOrderTransactionPagination =
  (data?: string[]) =>
  async ({ store, query }: Context) => {
    try {
      const { paginationParams, information, cacheKey } = store as iContextStore
      const { limit, offset, order, sort } = paginationParams as iContextParamsPagination
      const { data: orderTransactions, count } = await listsOrderTransactionsPagination({ limit, offset, order, sort }, query, information)
      const transactions = orderTransactions.map((obj: any) => ({ ...obj, accountCode: obj.accountCode.toString() }))

      Object.assign(store, { body: { data: transactions, count } })
      await setCacheResponse({ cacheKey, body: { data: transactions, count }, timer: 15 })
    } catch (error) {
      throw throwError(error, 'handleListsOrderTransactionPagination')
    }
  }

export const handleUpdateShopeeOrderTransaction =
  (data?: string[]) =>
  async ({ body, store }: Context) => {
    try {
      const { id, language } = store as iContextStore
      const objectUpdate = await filterAllowedFields(body as Record<string, any>, platformUpdateOrderTransaction.shopee.allowedFields)
      const findShopeeOrderTransaction = { id }
      const { data: updatedShopeeOrderTransaction } = await updateShopeeOrderTransaction(findShopeeOrderTransaction, objectUpdate)
      if (!updatedShopeeOrderTransaction) return responseFormat({}, 'UPDATE_DATA_FAILED', language)
      const formattedOrderTransactions = { ...updatedShopeeOrderTransaction, accountCode: updatedShopeeOrderTransaction.accountCode.toString() }
      Object.assign(store, { body: formattedOrderTransactions })
    } catch (error) {
      throw throwError(error, 'handleUpdateShopeeOrderTransaction')
    }
  }

export const handleUpdateShopifyOrderTransaction =
  (data?: string[]) =>
  async ({ body, store }: Context) => {
    try {
      const { id, language } = store as iContextStore
      const objectUpdate = await filterAllowedFields(body as Record<string, any>, platformUpdateOrderTransaction.shopify.allowedFields)
      const findShopifyOrderTransaction = { id }
      const { data: updatedShopifyOrderTransaction } = await updateShopifyOrderTransaction(findShopifyOrderTransaction, objectUpdate)
      if (!updatedShopifyOrderTransaction) return responseFormat({}, 'UPDATE_DATA_FAILED', language)
      const formattedOrderTransactions = { ...updatedShopifyOrderTransaction, accountCode: updatedShopifyOrderTransaction.accountCode.toString() }
      Object.assign(store, { body: formattedOrderTransactions })
    } catch (error) {
      throw throwError(error, 'handleUpdateShopifyOrderTransaction')
    }
  }

export const handleDeleteShopeeOrderTransaction =
  (data?: string[]) =>
  async ({ store, body, set }: Context) => {
    try {
      console.log('handle delete order transaction')
      const { id, language } = store as iContextStore
      const { data: deletedShopeeOrderTransaction } = await deleteShopeeOrderTransaction({ id })
      if (!deletedShopeeOrderTransaction) return responseFormat({}, 'DELETE_DATA_FAILED', language)
      const formattedOrderTransactions = { ...deletedShopeeOrderTransaction, accountCode: deletedShopeeOrderTransaction.accountCode.toString() }
      Object.assign(store, { body: formattedOrderTransactions })
    } catch (error) {
      throw throwError(error, 'handleDeleteShopeeOrderTransaction')
    }
  }

export const handleDeleteShopifyOrderTransaction =
  () =>
  async ({ store, body, set }: Context) => {
    try {
      const { id, language } = store as iContextStore
      const { data: deletedShopifyOrderTransaction } = await deleteShopifyOrderTransaction({ id })
      if (!deletedShopifyOrderTransaction) return responseFormat({}, 'DELETE_DATA_FAILED', language)
      const formattedOrderTransactions = { ...deletedShopifyOrderTransaction, accountCode: deletedShopifyOrderTransaction.accountCode.toString() }
      Object.assign(store, { body: formattedOrderTransactions })
    } catch (error) {
      throw throwError(error, 'handleDeleteShopifyOrderTransaction')
    }
  }

export const handleCheckDuplicateOrderTransaction =
  (data?: string[]) =>
  async ({ store, body, set }: Context) => {
    try {
      const { language, information, fileUpload: objectFileUpload } = store as iContextStore
      const { SalesPlatform } = objectFileUpload as iResponseFileUpload
      const platform = SalesPlatform?.name as string
      if (!salesPlatform.map(platform => platform.name).includes(platform)) throw new Error(`Invalid or missing platform: ${platform}`)
      const processCheckDuplicateOrder = platform === 'SHOPEE' ? coreProcessCheckDuplicateShopeeOrder : platform === 'SHOPIFY' ? coreProcessCheckDuplicateShopifyOrder : coreProcessCheckDuplicateTiktokOrder
      const { checker, message, data } = await processCheckDuplicateOrder(objectFileUpload, information.id)
      console.log({ checker, message, data: data?.length })
      if (!checker) return responseFormat({}, 'GET_DATA_FAILED', language)
      const formattedOrderTransactions = data?.map((obj: any) => ({ ...obj, accountCode: obj.accountCode.toString(), taxId: obj.taxId?.toString() }))
      Object.assign(store, { body: { data: formattedOrderTransactions, count: data?.length || 0 } })
    } catch (error) {
      throw throwError(error, 'handleCheckDuplicateOrderTransaction')
    }
  }

export const handleCreateProductMaster =
  (data?: string[]) =>
  async ({ store, body, set }: Context) => {
    try {
      const { language, information, fileUpload: objectFileUpload } = store as iContextStore
      const { SalesPlatform } = objectFileUpload as iResponseFileUpload
      const platform = SalesPlatform?.name as string
      if (!salesPlatform.map(platform => platform.name).includes(platform)) {
        throw new Error(`Invalid or missing platform: ${platform}`)
      }
      const processCreateProductMaster = platform === 'PRODUCT_MASTER' ? coreProcessCreateProductMaster : coreProcessCreateProductMaster
      const { checker, message, data } = await processCreateProductMaster(objectFileUpload, information.id)
      console.log({ checker, message, data })
      if (!checker) return responseFormat({}, message, language)
      Object.assign(store, { body: data })
    } catch (error) {
      throw throwError(error, 'handleCreateProductMaster')
    }
  }

export const handleUpdateProductMaster =
  (data?: string[]) =>
  async ({ store, body, set }: Context) => {
    try {
      const { language } = store as iContextStore
      const { updateId } = store as { updateId: number }
      const objectUpdate = await filterAllowedFields(body as Record<string, any>, platformUpdateProductMaster.allowedFields)
      const { checker, message, data } = await updateProductMaster(objectUpdate, updateId)
      if (!checker) return responseFormat({}, message, language)
    } catch (error) {
      throw throwError(error, 'handleUpdateProductMaster')
    }
  }

export const handleDeleteProductMaster =
  () =>
  async ({ store, body, set }: Context) => {
    try {
    } catch (error) {
      throw throwError(error, 'handleDeleteProductMaster')
    }
  }
