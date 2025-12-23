export interface iBasicAuthConfig {
  username: string
  password: string
}

export interface iConfigJWT {
  hash: string
  options: object
}

export interface iServer {
  host: string
  port: number
  maxRequestSize: number
}

export interface iLanguage {
  code: string
  name?: string
}

export interface iFileLocations {
  tiktok: string
}
