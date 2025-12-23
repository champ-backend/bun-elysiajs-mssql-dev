import otpGenerator from 'otp-generator'
import { generateSha256 } from '@/libs/Password'
import { createUser, findAndUpdateUser } from '@/models/Users'
import { Prisma } from '@prisma/client'
import { encodeJWTToken } from '@/libs/JWT'
import { createDeviceInformation, deleteOneDeviceInformation, findFirstDeviceInformation } from '@/models/DeviceInformation'
import { iJwtTokenEncode, iUpdatedUser, iUserData } from '@/interfaces/Authentication'
import { throwError } from '@/libs/ErrorService'
import { iAdminDefault } from '@/interfaces/MasterDataCreate'

export const userRegister = async (dataParams: Partial<iUserData>): Promise<iUpdatedUser | undefined> => {
  if (!dataParams) return undefined
  const { username, password: newpassword, firstname, lastname, role = 'USER', status = 'ACTIVE', verifyCode = '' } = dataParams
  if (!username || !newpassword) return undefined

  const newSalt = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
  const newRefreshToken = otpGenerator.generate(20)
  const txt = `${newSalt}_${newpassword}`
  const hashedPassword = generateSha256(txt)

  const dataCreate: Prisma.UserCreateInput = {
    username: username,
    password: hashedPassword,
    firstname: firstname || '',
    lastname: lastname || '',
    role: role,
    salt: newSalt,
    verifyCode: verifyCode,
    refreshToken: newRefreshToken,
    status: status
  }

  const { data: createdUser } = await createUser(dataCreate)
  return createdUser
}

export const jwtEncodeLoginAndDeviceRecord = async (dataParams: Partial<iJwtTokenEncode>) => {
  const { id, ip, refreshToken, tokenType, loginType } = dataParams
  const generatedToken = await encodeJWTToken({ key: refreshToken, tokenType, loginType })
  const deviceInformationCreate: Prisma.DeviceInformationCreateInput = {
    User: { connect: { id } },
    accessToken: generatedToken || '',
    tokenType: tokenType || '',
    ipAddress: ip || '0.0.0.0'
  }

  const { data: existingDevice } = await findFirstDeviceInformation({ userId: id, tokenType: tokenType })
  if (existingDevice) await deleteOneDeviceInformation({ id: existingDevice.id })
  await createDeviceInformation(deviceInformationCreate)
  return generatedToken
}

export const updateUserPasswordWithSalt = async (username: string, newpassword: string): Promise<{ refreshToken: string }> => {
  try {
    const newSalt = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    const newRefreshToken = otpGenerator.generate(20)
    const txt = `${newSalt}_${newpassword}`
    const hashedPassword = generateSha256(txt)
    await findAndUpdateUser({ username }, { password: hashedPassword, salt: newSalt, refreshToken: newRefreshToken })
    return { refreshToken: newRefreshToken }
  } catch (error) {
    throw throwError(error, 'updateUserPasswordWithSalt')
  }
}

export const userRefreshToken = async (username: string): Promise<{ refreshToken: string }> => {
  try {
    const newRefreshToken = otpGenerator.generate(20)
    await findAndUpdateUser({ username }, { refreshToken: newRefreshToken })
    return { refreshToken: newRefreshToken }
  } catch (error) {
    throw throwError(error, 'userRefreshToken')
  }
}

export const userAdminRegister = async (dataParams: Partial<iAdminDefault>) => {
  try {
    const { email, firstName, lastName, role, status } = dataParams
    const verifyCode = otpGenerator.generate(50, { specialChars: false })
    const newSalt = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    const newRefreshToken = otpGenerator.generate(20)
    const tempPassword = 'Password@1'
    const hashedPassword = generateSha256(`${newSalt}_${tempPassword}`)
    const dataCreate: Prisma.UserCreateInput = {
      username: email || '',
      password: hashedPassword,
      firstname: firstName || '',
      lastname: lastName || '',
      role: role || 'ADMIN',
      salt: newSalt,
      verifyCode: verifyCode,
      refreshToken: newRefreshToken,
      status: status ?? 'ACTIVE'
    }
    const { data: createdUser } = await createUser(dataCreate)
    return createdUser
  } catch (error) {
    throw throwError(error, 'userAdminRegister')
  }
}
