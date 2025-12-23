import moment from 'moment'
import config from 'config'
import basicAuth from 'basic-auth'
import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { languageProject } from '@/libs/Language'
import otpGenerator from 'otp-generator'
import { jwtEncodeLoginAndDeviceRecord, updateUserPasswordWithSalt, userRefreshToken, userRegister } from '@/controllers/AuthenticationController'
import { decodeJWTDynamic, jwtTokenViewer } from '@/libs/JWT'
import { findFirstDeviceInformation } from '@/models/DeviceInformation'
import { findUserWhere } from '@/models/Users'
import { iBasicAuthConfig, iConfigJWT } from '@/interfaces/Config'
import { iContextStore } from '@/interfaces/Context'
import { iResetPassword, iResponseJWTDecode, iUserDetail } from '@/interfaces/Authentication'

const authentication = config.get<iBasicAuthConfig>('basicAuth')
const configJWT = config.get<iConfigJWT>('jwt')

export const basicAuthentication =
  (data?: string[]) =>
  async ({ request, set, store }: Context) => {
    try {
      const acceptLanguage = request.headers.get('accept-language')
      const protocol = request.headers.get('x-forwarded-proto') ?? (request.url.startsWith('https') ? 'https' : 'http')
      const host = request.headers.get('host') ?? ''
      if (!acceptLanguage) return responseFormat({ param: 'header', error: 'accept-language' }, 'MISSING_REQUIRED_VALUES', 'EN')
      const language: string = await languageProject(acceptLanguage)
      const authHeader = request.headers.get('authorization') || ''
      const credentials = basicAuth({ headers: { authorization: authHeader } })
      if (!credentials || credentials.name !== authentication.username || credentials.pass !== authentication.password) {
        set.status = 401
        set.headers['WWW-Authenticate'] = "Basic realm='Secure Area'"
        return responseFormat({}, 'BASIC_AUTH_FAIL', language)
      }
      Object.assign(store, { language, protocol, host })
    } catch (error) {
      throw throwError(error, 'basicAuthentication')
    }
  }

export const registerService =
  (data?: string[]) =>
  async ({ store }: Context) => {
    try {
      const { body, language }: any = store
      const verifyCode = otpGenerator.generate(50, { specialChars: false })

      const objectUserCreate: any = {
        username: body.username,
        password: body.password,
        firstname: body.firstname,
        lastname: body.lastname,
        role: 'USER',
        status: 'ACTIVE',
        verifyCode
      }

      const createdUser = await userRegister(objectUserCreate)
      const { id, username, firstname, lastname, status, createdAt }: any = createdUser
      return responseFormat({ id, username, firstname, lastname, status, createdAt }, 'POST_DATA_SUCCESS', language)
    } catch (error) {
      throw throwError(error, 'registerService')
    }
  }

export const loginService =
  (data?: string[]) =>
  async ({ store }: Context) => {
    try {
      const { language, platform, body, findUser, clientIp: ip } = store as iContextStore
      const { id, refreshToken } = findUser as { id: number; refreshToken: string }
      const encodeToken = { id, ip, refreshToken, loginType: 'NORMAL', tokenType: platform }
      const token = await jwtEncodeLoginAndDeviceRecord(encodeToken)
      Object.assign(store, { token })
    } catch (error) {
      throw throwError(error, 'loginService')
    }
  }

export const tokenAuthentication =
  (data?: string[]) =>
  async ({ set, request, store }: Context) => {
    try {
      const { language, platform } = store as iContextStore
      const token: string = request.headers.get('x-access-token') || ''
      if (!token) return responseFormat({ param: 'header', error: 'x-access-token' }, 'HEADER_REQUIRED_ACCESS_TOKEN', language)
      const viewToken = await jwtTokenViewer(token)
      if (!viewToken) return responseFormat({ error: 'x-access-token' }, 'ACCESS_TOKEN_IS_NOT_TRUE', language)
      const currentTime = moment().unix()
      const { exp: viewTokenExp } = viewToken as { exp: number }
      if (currentTime > viewTokenExp) {
        set.status = 403
        return responseFormat({}, 'TOKEN_EXPIRED', language)
      }
      const { data: deviceAccessToken } = await findFirstDeviceInformation({ accessToken: token })
      if (!deviceAccessToken) {
        set.status = 401
        return responseFormat({}, 'ACCESS_TOKEN_IS_NOT_TRUE', language)
      }
      const responseJWTDecode = decodeJWTDynamic(token, configJWT['hash'])
      const decodeJWT = responseJWTDecode as iResponseJWTDecode
      if (!responseJWTDecode || !decodeJWT['tokenType'] || decodeJWT['tokenType'] !== platform) return responseFormat({ param: 'header', error: 'x-access-token' }, 'ACCESS_TOKEN_IS_NOT_TRUE', language)
      const { data: responseUser } = await findUserWhere({ refreshToken: decodeJWT['key'] })
      if (!responseUser) {
        set.status = 401
        return responseFormat({}, 'ACCESS_TOKEN_IS_NOT_TRUE', language)
      }
      const { id, username, firstname, lastname, role, status } = responseUser
      if (status === 'INACTIVE') return responseFormat({}, 'USER_IS_BLOCKED', language)
      Object.assign(store, {
        information: { id, username, firstname, lastname, role, status }
      })
    } catch (error) {
      throw throwError(error, 'tokenAuthentication')
    }
  }

export const checkRolePermissionService =
  (allowedRoles: string[]) =>
  async ({ store, set }: Context) => {
    try {
      const { language, information } = store as iContextStore
      const { role } = information || {}
      if (!role) {
        set.status = 403
        return responseFormat({}, 'UNAUTHORIZED_NO_ROLE', language)
      }

      const isRoleAllowed = allowedRoles.includes(role)
      if (!isRoleAllowed) {
        set.status = 403
        return responseFormat({}, 'UNAUTHORIZED_TO_ACCESS', language)
      }
    } catch (error) {
      throw throwError(error, 'checkRolePermissionService')
    }
  }

export const resetPasswordService =
  (loginType = 'NORMAL') =>
  async ({ store }: Context) => {
    try {
      const { resetPassword, information, clientIp, platform } = store as { resetPassword: iResetPassword; information: iContextStore['information']; clientIp: string; platform: string }
      const { newPassword } = resetPassword
      const { id, username } = information
      const { refreshToken } = await updateUserPasswordWithSalt(username, newPassword)
      const encodeToken = { id, ip: clientIp, refreshToken, loginType, tokenType: platform }
      const token = await jwtEncodeLoginAndDeviceRecord(encodeToken)
      Object.assign(store, { token })
    } catch (error) {
      throw throwError(error, 'resetPasswordService')
    }
  }

export const adminResetPasswordService =
  (loginType = 'NORMAL') =>
  async ({ store }: Context) => {
    try {
      const { userDetail, clientIp, platform, newPassword } = store as { userDetail: iUserDetail; clientIp: string; platform: string; newPassword: string }
      const { id, username } = userDetail
      const { refreshToken } = await updateUserPasswordWithSalt(username, newPassword)
      const encodeToken = { id, ip: clientIp, refreshToken, loginType, tokenType: platform }
      const token = await jwtEncodeLoginAndDeviceRecord(encodeToken)
      Object.assign(store, { token })
    } catch (error) {
      throw throwError(error, 'adminResetPasswordService')
    }
  }

export const refreshTokenService =
  (loginType = 'NORMAL') =>
  async ({ store }: Context) => {
    try {
      const { information, clientIp, platform } = store as iContextStore
      const { id, username } = information
      const { refreshToken } = await userRefreshToken(username)
      const encodeToken = { id, ip: clientIp, refreshToken, loginType, platform }
      const token = await jwtEncodeLoginAndDeviceRecord(encodeToken)
      Object.assign(store, { token })
    } catch (error) {
      throw throwError(error, 'refreshTokenService')
    }
  }
