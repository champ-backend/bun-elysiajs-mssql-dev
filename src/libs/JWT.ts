import jwt, { JwtPayload } from 'jsonwebtoken'
import config from 'config'
import { iConfigJWT } from '@/interfaces/Config'
const jwtData = config.get<iConfigJWT>('jwt')
const jwtHash: string = jwtData.hash
const jwtOptions: object = jwtData.options

export const encodeJWTToken = async (dataParams: object): Promise<string> => {
  return jwt.sign(dataParams, jwtHash, jwtOptions)
}

// // Function to generate a JWT token
// export const generateToken = (payload: object, expiresIn: string = '1h') => {
//   return jwt.sign(payload, SECRET_KEY, { expiresIn })
// }

// // Decode JWT Token
// export const decodeJWTToken = async (token: string): Promise<object | false> => {
//   try {
//     return await jwt.verify(token, JWT.hash)
//   } catch (error) {
//     return false
//   }
// }

// // Encode JWT with Custom Hash
// export const encodeJWTDynamic = (data: object, hash: string, options?: object): string => {
//   return jwt.sign(data, hash, options)
// }

// // Decode JWT with Custom Hash
export const decodeJWTDynamic = (token: string, hash: string): JwtPayload | string | false => {
  try {
    return jwt.verify(token, hash) as JwtPayload | string
  } catch (error) {
    console.error('JWT Verification Failed:', error)
    return false
  }
}

export const jwtTokenViewer = async (data: string, options?: object): Promise<object | null> => {
  const decoded = jwt.decode(data, options)
  if (typeof decoded === 'string') {
    return null
  }
  return decoded
}
