export interface iResponseData {
  [key: string]: any
}

export interface iResponseMessage {
  name: string
  code: string
  description: { language: string; description: string }[]
}

export interface iLanguage {
  code: string
}

export interface iErrorFormat {
  param: string
  msg: iResponseFormat
}

export interface iResponseFormat {
  res_code: string
  res_type: string
  res_message: string
  res_data: iResponseData
  res_time: number
}
