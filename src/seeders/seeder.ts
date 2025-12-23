import authenticationResponses from '@/seeders/authenticationResponses.json'
import dataResponses from '@/seeders/dataResponses.json'
import errorResponses from '@/seeders/errorResponses.json'
import headerResponses from '@/seeders/headerResponses.json'
import validateResponses from '@/seeders/validateResponses.json'
import valuesResponses from '@/seeders/valuesResponses.json'
import languages from '@/seeders/languages.json'
import countries from '@/seeders/countries.json'
import adminDefault from '@/seeders/adminDefault.json'
import bankSetting from '@/seeders/bank.json'
import salesPlatform from '@/seeders/salesOnlinePlatform.json'
import materialGroups from '@/seeders/materialGroup.json'
import vatRates from '@/seeders/vatRates.json'
interface ResponseSet {
  responses: any[]
}

const responses = [authenticationResponses, dataResponses, errorResponses, headerResponses, validateResponses, valuesResponses]

const responsesNewSet = [
  ...(authenticationResponses as ResponseSet)['responses'],
  ...(dataResponses as ResponseSet)['responses'],
  ...(errorResponses as ResponseSet)['responses'],
  ...(headerResponses as ResponseSet)['responses'],
  ...(validateResponses as ResponseSet)['responses'],
  ...(valuesResponses as ResponseSet)['responses']
]

export { responses, responsesNewSet, languages, countries, adminDefault, bankSetting, salesPlatform, materialGroups, vatRates }
