import { Elysia } from 'elysia'
import { responseFormat } from '@/libs/ResponseFormatter'
import { basicAuthentication, checkRolePermissionService, tokenAuthentication } from '@/middlewares/AuthenticationMiddleware'
import { xPlatformValidate } from '@/validations/AuthenticationValidate'
import config from '@/pref/index'
import { iContextStore } from '@/interfaces/Context'
import { handleCaching } from '@/middlewares/RedisMiddleware'
import { checkParamsPagination, checkQueryDateAndTime } from '@/validations/SearchValidate'
import { historyRecordChecking, exportTransactions, listsExportHistories, dataWarehouseNotificationTest } from '@/middlewares/ExportHistoriesMiddleware'
import { checkHistoryRecordValidate } from '@/validations/ExportHistoryValidate'
const prefix: string = config.service.api
const pathname: string = `${prefix}/warehouse`

export const WarehouseRoutes = new Elysia().group(`${pathname}`, Routes =>
  Routes.guard({ beforeHandle: [basicAuthentication(), xPlatformValidate(), tokenAuthentication()] }, group =>
    group.get(
      '/check-stock',
      ({ set, store }) => {
        const { language, body } = store as iContextStore
        set.status = 200
        return responseFormat(body, 'GET_DATA_SUCCESS', language)
      },
      {
        beforeHandle: [checkRolePermissionService(['ADMIN', 'USER']), checkQueryDateAndTime(), dataWarehouseNotificationTest()]
      }
    )
  )
)
