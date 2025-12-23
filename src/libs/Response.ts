import moment from 'moment'
import { responsesNewSet, languages as languagesRaw } from '@/seeders/seeder'
import { throwError } from '@/libs/ErrorService'
import { iErrorFormat, iLanguage, iResponseData, iResponseFormat, iResponseMessage } from '@/interfaces/ResponseFormat'

class ResponseService {
  private static getTimestamp(): number {
    return moment.utc().utcOffset('+07:00').unix()
  }

  private static formatError(data: any): iResponseFormat {
    return {
      res_code: '9999',
      res_type: 'error',
      res_message: 'ERROR',
      res_data: data,
      res_time: this.getTimestamp()
    }
  }

  private static formatSuccess(code: string, type: 'success' | 'error', message: string, data: iResponseData): iResponseFormat {
    return {
      res_code: code,
      res_type: type,
      res_message: message,
      res_data: data,
      res_time: this.getTimestamp()
    }
  }

  public static format(data: iResponseData = {}, message = 'ERROR', languages = 'EN'): iResponseFormat {
    try {
      const responseMessage: iResponseMessage | undefined = responsesNewSet.find(v => v.name === message)
      if (!responseMessage || !responseMessage.name) {
        return this.formatError('Not have response message, please check seeder.')
      }

      const languageItem: iLanguage | undefined = languagesRaw.find(v => v.code === languages)
      if (!languageItem) {
        return this.formatError('Not have response languages, please check seeder.')
      }

      const descriptionItem = responseMessage.description.find(v => v.language === languageItem.code)
      if (!descriptionItem || !descriptionItem.language) {
        return this.formatError('Not have description message, please check seeder.')
      }

      const resType = responseMessage.code !== '0000' ? 'error' : 'success'
      return this.formatSuccess(responseMessage.code, resType, descriptionItem.description, data)
    } catch (error) {
      throw throwError(error, 'ResponseService.format')
    }
  }

  public static formatValidate(errors: iErrorFormat[]): iResponseFormat {
    const error = errors[0]
    error.msg.res_data = { param: error.param, ...error.msg.res_data }
    return error.msg
  }

  public static formatValidateWithRegex(errors: iErrorFormat[]): iResponseFormat {
    const { msg, param } = errors[0]
    msg.res_data = { param, ...msg.res_data }
    return msg
  }
}

export default ResponseService
