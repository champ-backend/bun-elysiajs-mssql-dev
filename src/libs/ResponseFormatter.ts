import moment from 'moment'
import { responsesNewSet, languages as languagesRaw } from '@/seeders/seeder'
import { throwError } from '@/libs/ErrorService'
import { iErrorFormat, iLanguage, iResponseData, iResponseFormat, iResponseMessage } from '@/interfaces/ResponseFormat'

function responseFormat(data: iResponseData = {}, message = 'ERROR', languages = 'EN'): iResponseFormat {
  try {
    const filter: iResponseMessage | undefined = responsesNewSet.find(v => v.name === message)
    if (!filter) return responseFormatError('Not have response message, please check seeder.')
    const { name, code, description } = filter
    if (!name) return responseFormatError('Not have response message, please check seeder.')
    const filterLanguage: iLanguage | undefined = languagesRaw.find(v => v.code === languages)
    if (!filterLanguage) return responseFormatError('Not have response languages, please check seeder.')
    const filterDesc = description.find(v => v.language === filterLanguage.code)
    if (!filterDesc) return responseFormatError('Not have description message, please check seeder.')
    const { language, description: Message } = filterDesc
    if (!language) return responseFormatError('Not have description message, please check seeder.')
    if (code !== '0000') return responseFormatSuccess(code, 'error', Message, data)
    return responseFormatSuccess(code, 'success', Message, data)
  } catch (error) {
    throw throwError(error, 'responseFormat')
  }
}

function responseFormatError(data: any): iResponseFormat {
  return {
    res_code: '9999',
    res_type: 'error',
    res_message: 'ERROR',
    res_data: data,
    res_time: moment.utc().utcOffset('+07:00').unix()
  }
}

function responseFormatSuccess(code: string, type: string, message: string, data: iResponseData): iResponseFormat {
  return {
    res_code: code,
    res_type: type,
    res_message: message,
    res_data: data,
    res_time: moment.utc().utcOffset('+07:00').unix()
  }
}

function responseFormatValidate(errors: iErrorFormat[]): iResponseFormat {
  let error = errors[0]
  error.msg.res_data = { param: error.param, ...error.msg.res_data }
  return error.msg
}

function responseFormatValidateWithRegex(errors: iErrorFormat[]): iResponseFormat {
  let { msg, param } = errors[0]
  msg.res_data = { param, ...msg.res_data }
  return msg
}

export { responseFormat, responseFormatValidate, responseFormatValidateWithRegex }
