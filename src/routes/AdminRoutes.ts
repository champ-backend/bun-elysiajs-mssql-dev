import { Elysia } from 'elysia'
import { responseFormat } from '@/libs/ResponseFormatter'
import { adminResetPasswordService, basicAuthentication, checkRolePermissionService, registerService, resetPasswordService, tokenAuthentication } from '@/middlewares/AuthenticationMiddleware'
import { xPlatformValidate } from '@/validations/AuthenticationValidate'
import config from '@/pref/index'
import { iContextStore } from '@/interfaces/Context'
import { adminResetPasswordValidate, registerValidate, resetPasswordValidate } from '@/validations/LoginValidate'
const prefix: string = config.service.api
const pathname: string = `${prefix}/admin`

export const AdminRoutes = new Elysia().group(`${pathname}`, Routes =>
  Routes.guard({ beforeHandle: [basicAuthentication(), xPlatformValidate(), tokenAuthentication()] }, group =>
    group
      .post(
        '/reset-password',
        ({ set, store }) => {
          const { language, body } = store as iContextStore
          set.status = 200
          return responseFormat({}, 'RESET_PASSWORD_SUCCESS', language)
        },
        {
          beforeHandle: [checkRolePermissionService(['ADMIN']), adminResetPasswordValidate(), adminResetPasswordService()]
        }
      )
      .post(
        `/register`,
        ({ set, body, store }) => {
          const { language } = store as iContextStore
          set.status = 200
          return responseFormat({}, 'POST_DATA_SUCCESS', language)
        },
        { beforeHandle: [checkRolePermissionService(['ADMIN']), registerValidate(), registerService()] }
      )
  )
)
