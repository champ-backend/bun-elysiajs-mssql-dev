export interface iUserData {
  username: string
  password: string
  firstname: string
  lastname: string
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE'
  verifyCode: string
  refreshToken: string
}

export interface iUpdatedUser {
  firstname: string
  lastname: string
  salt: string
  password: string
  refreshToken: string
}

export interface iJwtTokenEncode {
  id: number
  ip: string
  refreshToken: string
  tokenType: string
  loginType: string
}

export interface iResponseJWTDecode {
  tokenType: string
  key: string
}

export interface iResetPassword {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface iAdminResetPassword {
  email: string
  newPassword: string
  confirmPassword: string
}

export interface iUserDetail {
  id: number
  username: string
  firstname: string
  lastname: string
  role: string
  status: string
  createdAt: string
}
