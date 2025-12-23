import { iLanguage } from '@/interfaces/Config'
import { languages } from '@/seeders/seeder'

export const languageProject = async (language: string = 'EN'): Promise<string> => {
  const filterLanguage: iLanguage | undefined = languages.find(v => v.code === language)
  if (!filterLanguage) return 'EN'
  return filterLanguage.code
}
