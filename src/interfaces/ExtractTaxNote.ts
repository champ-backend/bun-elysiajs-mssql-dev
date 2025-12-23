export type ParsedAddress = {
  raw: string | null
  houseNo: string | null
  moo: string | null
  soi: string | null
  tambon: string | null
  amphoe: string | null
  province: string | null
  zipcode: string | null
}

export type ParsedNote = {
  fullName: string | null
  taxId: string | null
  phone: string | null
  email: string | null
  address: ParsedAddress
}
