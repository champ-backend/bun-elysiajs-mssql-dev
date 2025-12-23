import { Elysia } from 'elysia'
import { responseFormat } from '@/libs/ResponseFormatter'
import { basicAuthentication, checkRolePermissionService, loginService, refreshTokenService, resetPasswordService, tokenAuthentication } from '@/middlewares/AuthenticationMiddleware'
import { xPlatformValidate } from '@/validations/AuthenticationValidate'
import { loginValidate, registerValidate, resetPasswordValidate } from '@/validations/LoginValidate'
import config from '@/pref/index'
import { iContextStore } from '@/interfaces/Context'
const prefix: string = config.service.api
const pathname: string = `${prefix}/user`

export const UserRoutes = new Elysia().group(`${pathname}`, Routes =>
  Routes.guard({ beforeHandle: [basicAuthentication(), xPlatformValidate()] }, group =>
    group
      .get(
        '/info',
        ({ set, store }) => {
          const { language, information } = store as iContextStore
          set.status = 200
          return responseFormat(information, 'GET_DATA_SUCCESS', language)
        },
        {
          beforeHandle: [tokenAuthentication()]
        }
      )

      // .put('/update/:id', ({ set, params, body, store }) => {
      //   const { language } = store as iContextStore
      //   set.status = 200
      //   return responseFormat({}, 'UPDATE_DATA_SUCCESS', language)
      // })
      // .delete('/delete/:id', ({ set, params, store }) => {
      //   const { language } = store as { language: string }
      //   set.status = 200
      //   return responseFormat({}, 'DELETE_DATA_SUCCESS', language)
      // })
      .post(
        `/login`,
        ({ set, body, store }) => {
          set.status = 200
          const { token, language } = store as iContextStore
          return responseFormat({ token }, 'LOGIN_SUCCESS', language)
        },
        { beforeHandle: [basicAuthentication(), xPlatformValidate(), loginValidate(), loginService()] }
      )
      .get(
        `/refresh-token`,
        ({ set, body, store }) => {
          const { language, token } = store as iContextStore
          set.status = 200
          return responseFormat({ token }, 'CHANGE_REFRESH_TOKEN_SUCCESS', language)
        },
        { beforeHandle: [tokenAuthentication(), refreshTokenService()] }
      )
      .post(
        '/reset-password',
        ({ set, store }) => {
          const { language, token } = store as iContextStore
          set.status = 200
          return responseFormat({ token }, 'CHANGE_PASSWORD_SUCCESS', language)
        },
        {
          beforeHandle: [tokenAuthentication(), checkRolePermissionService(['USER']), resetPasswordValidate(), resetPasswordService()]
        }
      )
  )
)
