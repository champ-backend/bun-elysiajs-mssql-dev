export interface iContextStore {
  files: object[]
  created: object[]
  result: any
  language: string
  dir: string
  pathUpload: string
  token: string
  platform: string
  clientIp: string
  username: string
  body: object[]
  id: number
  findUser: object
  protocol: string
  host: string
  fileUpload: object
  paginationParams: object
  information: {
    id: number
    role: string
    username: string
  }
  cacheKey: string
}

export interface iContextBody {
  upload: { name: string; type: string; size: number }[]
  salesPlatform?: string
}

export interface iContactBodyOrderTransaction {
  fileKey: string
}

export interface iContextParamsPagination {
  sort: string
  order: string
  offset: number
  limit: number
}

export interface iContextParamsSearch {
  type?: string
}

export interface iContextBodyCheckHistoryRecord {
  record: number[]
}
