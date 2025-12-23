export interface iSalesPlatform {
  id?: number
  name: string
  status?: string
}

export interface iAdminDefault {
  firstName: string
  lastName: string
  email: string
  role: string
  status?: string
}

export interface iVatRate {
  vat: number
  country: string
  status: string
}
