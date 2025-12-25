import { throwError } from '@/libs/ErrorService'
import { adminDefault } from '@/seeders/seeder'
import { iAdminDefault } from '@/interfaces/MasterDataCreate'
import { findManyUserWhere } from '@/models/Users'
import { userAdminRegister } from '@/controllers/AuthenticationController'

export const masterDataCreate = async (): Promise<void> => {
  try {
    const [{ data: userAdminData }] = await Promise.all([findManyUserWhere({})])
    await Promise.all([createAdminDefault(adminDefault, userAdminData)])
  } catch (error) {
    throw throwError(error, 'masterDataCreate')
  }
}

async function createAdminDefault(adminDefault: iAdminDefault[], userAdminData: any[]) {
  if (adminDefault.length !== userAdminData.length) {
    for (const key in adminDefault) {
      if (adminDefault.hasOwnProperty(key)) {
        const keyAdminDefault: iAdminDefault = adminDefault[key]
        const isFound = userAdminData.find(v => v?.username === keyAdminDefault.email)
        if (!isFound) {
          const createInput: iAdminDefault = {
            email: keyAdminDefault.email,
            firstName: keyAdminDefault.firstName,
            lastName: keyAdminDefault.lastName,
            role: keyAdminDefault.role,
            status: keyAdminDefault.status
          }
          await userAdminRegister(createInput)
        }
      }
    }
  }
}
