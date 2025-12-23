import * as hasPassword from 'password-hash'

export const passwordVerify = (value: string, hashValue: string): boolean => hasPassword.verify(value, hashValue)
export const isHashedPassword = (value: string): boolean => hasPassword.isHashed(value)
export const generatePassword = (value: string): string => hasPassword.generate(value)
export const generateSha256 = (value: string): string => hasPassword.generate(value, { algorithm: 'sha256' })
