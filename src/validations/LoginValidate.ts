import { Context } from 'elysia'
import { throwError } from '@/libs/ErrorService'
import { responseFormat } from '@/libs/ResponseFormatter'
import { z as bodySchema } from 'zod'
import { extractMessagesAsync } from '@/libs/ExtractMessage'
import { findUserUnique } from '@/models/Users'
import { passwordVerify } from '@/libs/Password'
import { iContextStore } from '@/interfaces/Context'
import { iAdminResetPassword, iResetPassword } from '@/interfaces/Authentication'

export const loginValidate =
  (data?: string[]) =>
  async ({ request, store, body }: Context) => {
    try {
      const { language, platform } = store as iContextStore
      const loginSchema = bodySchema.object({
        username: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(5, { message: 'MISSING_REQUIRED_VALUES' })
          .max(50, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z0-9@_.-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        password: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(9, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(50, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_+?=-])(?=.*\d)(?=.*[\W_]).{9,}$/, { message: 'INVALID_PASSWORD_FORMAT' })
      })

      const validation = loginSchema.safeParse(body)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      const { username, password }: any = body
      const { data: findUser } = await findUserUnique({ username })
      if (!findUser) return responseFormat({}, 'AUTH_LOGIN_FAILURE', language)

      const isMatch = passwordVerify(`${findUser['salt']}_${password}`, findUser['password'])
      if (!isMatch) return responseFormat({}, 'AUTH_LOGIN_FAILURE', language)

      Object.assign(store, {
        body: validation.data,
        findUser: findUser
      })
    } catch (error) {
      throw throwError(error, 'loginValidate')
    }
  }

export const registerValidate =
  (data?: string[]) =>
  async ({ store, body }: Context) => {
    try {
      const { language, platform } = store as iContextStore
      const registerSchema = bodySchema.object({
        username: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .email({ message: 'INVALID_EMAIL_FORMAT' })
          .min(5, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(100, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z0-9@._-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        firstname: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(1, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(100, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z@_.-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        lastname: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(1, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(100, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z@_.-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        password: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .min(9, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(50, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_+?=-])(?=.*\d)(?=.*[\W_]).{9,}$/, { message: 'INVALID_PASSWORD_FORMAT' })
      })

      const validation = registerSchema.safeParse(body)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      const { username } = body as iContextStore
      const { data: responseFindUser } = await findUserUnique({ username })
      if (responseFindUser) {
        const { id, firstname, lastname, createdAt, status } = responseFindUser
        return responseFormat({ id, username, firstname, lastname, status, createdAt }, 'USERNAME_IS_ALREADY_EXISTS', language)
      }

      Object.assign(store, { body: validation.data })
    } catch (error) {
      throw throwError(error, 'RegisterValidate')
    }
  }

export const resetPasswordValidate =
  (data?: string[]) =>
  async ({ store, body }: Context) => {
    try {
      const { language, information } = store as iContextStore
      const { currentPassword, newPassword, confirmPassword } = body as iResetPassword
      const passwordSchema = bodySchema
        .string({ message: 'REQUIRED_ONLY_STRING' })
        .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
        .min(9, { message: 'CHARACTER_MINIMUM_LENGTH' })
        .max(50, { message: 'CHARACTER_OVER_LENGTH' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_+?=-])(?=.*\d)(?=.*[\W_]).{9,}$/, {
          message: 'INVALID_PASSWORD_FORMAT'
        })

      const resetPasswordSchema = bodySchema.object({
        currentPassword: passwordSchema,
        newPassword: passwordSchema,
        confirmPassword: passwordSchema
      })

      const validation = resetPasswordSchema.safeParse(body)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      if (newPassword !== confirmPassword) return responseFormat({}, 'NEW_PASSWORD_CONFIRM_MISMATCH', language)
      if (newPassword === currentPassword) return responseFormat({}, 'PASSWORD_SHOULD_BE_DIFFERENT', language)
      const { data: findUser } = await findUserUnique({ username: information.username })
      if (!findUser) return responseFormat({}, 'AUTH_LOGIN_FAILURE', language)
      const isMatch = passwordVerify(`${findUser['salt']}_${currentPassword}`, findUser['password'])
      if (!isMatch) return responseFormat({}, 'AUTH_LOGIN_FAILURE', language)
      Object.assign(store, { resetPassword: validation.data })
    } catch (error) {
      throw throwError(error, 'resetPasswordValidate')
    }
  }

export const adminResetPasswordValidate =
  (data?: string[]) =>
  async ({ store, body }: Context) => {
    try {
      const { language, information } = store as iContextStore
      const { email, newPassword, confirmPassword } = body as iAdminResetPassword
      const passwordSchema = bodySchema
        .string({ message: 'REQUIRED_ONLY_STRING' })
        .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
        .min(9, { message: 'CHARACTER_MINIMUM_LENGTH' })
        .max(50, { message: 'CHARACTER_OVER_LENGTH' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_+?=-])(?=.*\d)(?=.*[\W_]).{9,}$/, {
          message: 'INVALID_PASSWORD_FORMAT'
        })

      const resetPasswordSchema = bodySchema.object({
        email: bodySchema
          .string({ message: 'REQUIRED_ONLY_STRING' })
          .nonempty({ message: 'MISSING_REQUIRED_VALUES' })
          .email({ message: 'INVALID_EMAIL_FORMAT' })
          .min(5, { message: 'CHARACTER_MINIMUM_LENGTH' })
          .max(100, { message: 'CHARACTER_OVER_LENGTH' })
          .regex(/^[a-zA-Z0-9@._-]+$/, { message: 'SPECIAL_CHARACTER_NOT_ALLOW' }),
        newPassword: passwordSchema,
        confirmPassword: passwordSchema
      })

      const validation = resetPasswordSchema.safeParse(body)
      if (!validation.success) {
        const errors = validation.error.format()
        const { keyErrors, messages: errorMessage } = await extractMessagesAsync(errors)
        return responseFormat(keyErrors, errorMessage[0], language)
      }

      if (newPassword !== confirmPassword) return responseFormat({}, 'NEW_PASSWORD_CONFIRM_MISMATCH', language)
      const { data: findUser } = await findUserUnique({ username: email })
      if (!findUser) return responseFormat({}, 'USER_NOT_FOUND', language)
      Object.assign(store, { userDetail: findUser, newPassword })
    } catch (error) {
      throw throwError(error, 'adminResetPasswordValidate')
    }
  }
