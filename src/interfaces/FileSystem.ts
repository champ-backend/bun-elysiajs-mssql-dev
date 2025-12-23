export interface iFileSystem {
  type: string[]
  limit: number
  directoryPath: string
  filename: string
}

export interface iHandleFileUpload {
  pathUpload: string
  dirName: string
  userId: number
  salesPlatefromId?: number
  protocol: string
  host?: string
}

export interface iResponseFileUpload {
  id?: number
  fileKey?: string
  fileName?: string
  type?: string
  path?: string
  size?: number
  url?: string
  isPublic?: boolean
  SalesPlatform?: {
    id: number
    name: string
    status: string
  }
}

export interface iFilePlatform {
  id?: number
  name?: 'shopee' | 'Shopify'
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface iContextStoreFileSystem {
  files: object[]
  language: string
  dir: string
  pathUpload: string
  token: string
  platform: string
  clientIp: string
  username: string
  body: object
  findUser: object
  protocol: string
  host: string
  salesPlatefromId?: number
  fileUpload: object
  information: {
    id: number
    username: string
  }
}

export interface iFileOperationResponse {
  checker: boolean
  message: string
}

export interface iFileResultResponse {
  type: string
  name: string
  fileBuffer: any
}

export interface iResDataPlatform {
  id?: number
  isValid?: boolean
  detectedPlatform?: string
  matchPercentage?: number
  missingHeaders?: string[]
  extraHeaders?: string[]
  matchedHeaders?: string[]
}

export interface iHeaderMapType {
  [header: string]: {
    keyName: string
    type: 'number' | 'boolean' | 'datetime' | 'string'
  }
}

export interface iSheetRow {
  [key: string]: any
}
