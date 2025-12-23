import { Elysia } from 'elysia'
import { responseFormat } from '@/libs/ResponseFormatter'
import { basicAuthentication, checkRolePermissionService, tokenAuthentication } from '@/middlewares/AuthenticationMiddleware'
import { xPlatformValidate } from '@/validations/AuthenticationValidate'
import config from '@/pref/index'
import { iContextStore } from '@/interfaces/Context'
import {
  handleCheckDuplicateOrderTransaction,
  handleCreateOrderTransaction,
  handleCreateProductMaster,
  handleDeleteShopeeOrderTransaction,
  handleDeleteShopifyOrderTransaction,
  handleListsOrderTransactionPagination,
  handleUpdateProductMaster,
  handleUpdateShopeeOrderTransaction,
  handleUpdateShopifyOrderTransaction
} from '@/middlewares/OrderTransactionMiddleware'
import { checkBodyOrderTransaction, checkBodyOrderTransactionCreate, checkBodyShopee, checkBodyShopify, checkParamsOrderTransaction, checkParamsProductMasterUpdate } from '@/validations/OrderTransactionValidate'
import { checkSearchParamsById, checkParamsPagination, checkQueryDateAndTime } from '@/validations/SearchValidate'
import { handleCaching } from '@/middlewares/RedisMiddleware'
import { handleSelectProductMaster } from '@/middlewares/ProductMasterMiddleware'
const prefix: string = config.service.api
const pathname: string = `${prefix}/order-transaction`

export const OrderTransactionRoutes = new Elysia().group(`${pathname}`, Routes =>
  Routes.guard({ beforeHandle: [basicAuthentication(), xPlatformValidate(), tokenAuthentication()] }, group =>
    group
      .get(
        '/lists/:limit/:offset/:order/:sort',
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'GET_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkParamsPagination(), checkQueryDateAndTime(), handleCaching(), handleListsOrderTransactionPagination()]
        }
      )
      .get(
        '/:id',
        ({ set, store }) => {
          const { language } = store as iContextStore
          set.status = 200
          return responseFormat({}, 'GET_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [checkRolePermissionService(['ADMIN', 'USER'])]
        }
      )
      .patch(
        '/update/shopee/:id',
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'UPDATE_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkBodyShopee(), checkSearchParamsById(), handleUpdateShopeeOrderTransaction()]
        }
      )
      .patch(
        '/update/shopify/:id',
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'UPDATE_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkBodyShopify(), checkSearchParamsById(), handleUpdateShopifyOrderTransaction()]
        }
      )
      .delete(
        '/delete/shopee/:id',
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'DELETE_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkSearchParamsById(), handleDeleteShopeeOrderTransaction()]
        }
      )
      .delete(
        '/delete/shopify/:id',
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'DELETE_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkSearchParamsById(), handleDeleteShopifyOrderTransaction()]
        }
      )
      .post(
        `/create`,
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'POST_DATA_SUCCESS', language)
        },
        { beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkBodyOrderTransaction(), checkBodyOrderTransactionCreate(), handleCreateOrderTransaction()] }
      )
      .post(
        `/product-master/create`,
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'POST_DATA_SUCCESS', language)
        },
        { beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkBodyOrderTransaction(), handleCreateProductMaster()] }
      )
      .patch(
        `/product-master/update/:id`,
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'POST_DATA_SUCCESS', language)
        },
        { beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkParamsProductMasterUpdate(), handleUpdateProductMaster()] }
      )
      .get(
        `/product-master/lists/:limit/:offset/:order/:sort`,
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'POST_DATA_SUCCESS', language)
        },
        { beforeHandle: [checkRolePermissionService(['ADMIN']), checkParamsPagination(), checkQueryDateAndTime(), handleCaching(), handleSelectProductMaster()] }
      )
      .get(
        `/check-duplicate/:fileKey`,
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat(body, 'GET_DATA_SUCCESS', language)
        },
        { beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkParamsOrderTransaction(), handleCheckDuplicateOrderTransaction()] }
      )
  )
)
