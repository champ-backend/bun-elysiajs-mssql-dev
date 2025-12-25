import { throwError } from '@/libs/ErrorService'
import { createOneSalesPlatformOnline, findManySalesPlatformWhere } from '@/models/SalesPlatform'
import { salesPlatform, adminDefault, materialGroups, vatRates } from '@/seeders/seeder'
import { Prisma } from '@prisma/client'
import { iAdminDefault, iSalesPlatform, iVatRate } from '@/interfaces/MasterDataCreate'
import { findManyUserWhere } from '@/models/Users'
import { userAdminRegister } from '@/controllers/AuthenticationController'
import { createMaterialGroupOne, findManyMaterialGroupWhere } from '@/models/MaterialGroup'
import { iMaterialGroup } from '@/interfaces/materialGroup'

import { createVatRatePrisma, findManyVatRatesWhere } from '@/models/VatRates'
import { findManyProductMaster } from '@/models/ProductMaster'
import { findAllWarehouse } from '@/models/Warehouse'
import { matchesStockWhere } from '@/libs/OrderTransactions'


export const masterDataCreate = async (): Promise<void> => {
  try {
    const [{ data: salesPlatformData }, { data: userAdminData }, { data: materialGroupsData }, { data: vatRateData }, { data: productMasterData }] = await Promise.all([
      findManySalesPlatformWhere({}),
      findManyUserWhere({}),
      findManyMaterialGroupWhere({}),
      findManyVatRatesWhere({}),
      findManyProductMaster({})
    ])
    await Promise.all([createSalesPlatform(salesPlatform, salesPlatformData), createAdminDefault(adminDefault, userAdminData), createMaterialGroups(materialGroups, materialGroupsData), createVatRates(vatRates, vatRateData)])
  } catch (error) {
    throw throwError(error, 'masterDataCreate')
  }
}

async function createSalesPlatform(salesPlatform: iSalesPlatform[], salesPlatformData: iSalesPlatform[]) {
  if (salesPlatform.length !== salesPlatformData.length) {
    for (const key in salesPlatform) {
      if (salesPlatform.hasOwnProperty(key)) {
        const keySalesPlatform: iSalesPlatform = salesPlatform[key]
        const isFound = salesPlatformData.find(v => v?.name === keySalesPlatform?.name)
        if (!isFound) {
          const createInput: Prisma.SalesPlatformCreateInput = {
            name: keySalesPlatform.name,
            status: keySalesPlatform.status
          }
          await createOneSalesPlatformOnline(createInput)
        }
      }
    }
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

async function createMaterialGroups(materialGroups: iMaterialGroup[], materialGroupsData: any[]) {
  if (materialGroups.length !== materialGroupsData.length) {
    for (const key in materialGroups) {
      if (materialGroups.hasOwnProperty(key)) {
        const keyMaterialGroups: iMaterialGroup = materialGroups[key]
        const isFound = materialGroupsData.find(v => v?.mg4 === keyMaterialGroups?.mg4)
        if (!isFound) {
          const createInput: Prisma.MaterialGroupCreateInput = {
            profitCenter: keyMaterialGroups.profitCenter,
            mg4: keyMaterialGroups.mg4,
            materialGroup4: keyMaterialGroups.materialGroup
          }
          await createMaterialGroupOne(createInput)
        }
      }
    }
  }
}

async function createVatRates(vatRates: iVatRate[], vatRatesData: any[]) {
  if (vatRates.length !== vatRatesData.length) {
    for (const key in vatRates) {
      if (vatRates.hasOwnProperty(key)) {
        const keyVatRates: iVatRate = vatRates[key]
        const isFound = vatRatesData.find(v => v?.country === keyVatRates?.country)
        if (!isFound) {
          const createInput: Prisma.VatRatesCreateInput = {
            rate: keyVatRates.vat,
            country: keyVatRates.country,
            status: keyVatRates.status,
            description: `VAT Rate for ${keyVatRates.country}`
          }
          await createVatRatePrisma(createInput)
        }
      }
    }
  }
}
