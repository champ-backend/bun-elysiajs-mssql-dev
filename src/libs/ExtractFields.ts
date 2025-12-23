import { add } from 'date-fns'
import { t } from 'elysia'
import { log } from 'node:util'

const extractAddressParts = (address: string) => {
  const tambonMatch = address.match(/ต\.([^\s]+)/)
  const amphoeMatch = address.match(/อ\.([^\s]+)/)
  const provinceMatch = address.match(/จ\.([^\s]+)/)
  const zipcodeMatch = address.match(/\b\d{5}\b/)
  const mooMatch = address.match(/ม\.?\s*(\d+)/)
  const soiMatch = address.match(/ซอย\s*(\d+)/)
  const houseMatch = address.match(/^(\d+\s*ซอย\s*\d+\s*บ้าน[^\s]+)/)

  return {
    houseNo: houseMatch?.[1]?.trim() ?? null,
    moo: mooMatch?.[1] ?? null,
    soi: soiMatch?.[1] ?? null,
    tambon: tambonMatch?.[1] ?? null,
    amphoe: amphoeMatch?.[1] ?? null,
    province: provinceMatch?.[1] ?? null,
    zipcode: zipcodeMatch?.[0] ?? null
  }
}

export async function extractFieldsTaxId(address: string) {
  if (address == null) return null
  const taxId = address.match(/\b\d{13}\b/)
  console.log({ taxId })
  return taxId?.[0]?.trim() || null
}

export const extractFields = async (raw: string) => {
  const taxId = raw.match(/\b\d{13}\b/)?.[0] ?? null
  const phone = raw.match(/\b0\d{9}\b/)?.[0] ?? null
  const email = raw.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/)?.[0] ?? null
  const lines = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
  const fullName = lines.find(line => /^[^\d\s]+/.test(line) && !line.includes('TaxReceipt')) ?? null
  const addressLines = lines.filter(l => l !== fullName && !l.includes(taxId ?? '') && !l.includes(phone ?? '') && !l.includes(email ?? '') && !/TaxReceipt/i.test(l))
  const addressRaw = addressLines.join(' ').trim()
  const addressParsed = extractAddressParts(addressRaw)
  // console.log('###########################################')

  return {
    fullName,
    taxId,
    phone,
    email,
    address: {
      raw: addressRaw || null,
      ...addressParsed
    }
  }
}

// export async function extractFieldsHouseNo(address: string) {

// }

// export async function extractFieldsMoo(address: string) {
//   const mooMatch = address.match(/ม\.?\s*(\d+)/)
//   const mooMatch2 = address.match(/หมู่\.?\s*(\d+)/)
//   console.log({ mooMatch, mooMatch2 })
//   return mooMatch?.[1]?.trim() || mooMatch2?.[1]?.trim() || null
// }

// export async function extractFieldsTambon(address: string) {
//   const tambonMatch = address.match(/ต\.([^\s]+)/)
//   const tambonMatch2 = address.match(/ตำบล\.([^\s]+)/)
//   console.log('tambonMatch', { tambonMatch })
//   return tambonMatch?.[1]?.trim() || tambonMatch2?.[1]?.trim() || null
// }

// export async function extractFieldsAmphoe(address: string) {
//   const amphoeMatch = address.match(/อ\.([^\s]+)/)
//   const amphoeMatch2 = address.match(/อำเภอ\.([^\s]+)/)
//   console.log({ amphoeMatch, amphoeMatch2 })
//   return amphoeMatch?.[1]?.trim() || amphoeMatch2?.[1]?.trim() || null
// }

// export async function extractFieldsProvince(address: string) {
//   const provinceMatch = address.match(/จ\.([^\s]+)/)
//   const provinceMatch2 = address.match(/จังหวัด\.([^\s]+)/)
//   console.log({ provinceMatch, provinceMatch2 })
//   return provinceMatch?.[1]?.trim() || provinceMatch2?.[1]?.trim() || null
// }

// export async function extractFieldsZipcode(address: string) {
//   const zipcodeMatch = address.match(/\b\d{5}\b/)
//   console.log({ zipcodeMatch })
//   return zipcodeMatch?.[0]?.trim() || null
// }

// export async function tambonMatch(address: string) {
//   const tambonMatch = address.match(/ต\.([^\s]+)/)
//   const tambonMatch2 = address.match(/ตำบล\.([^\s]+)/)
//   console.log('tambonMatch', { tambonMatch })

//   const amphoeMatch = address.match(/อ\.([^\s]+)/)
//   const amphoeMatch2 = address.match(/อำเภอ\.([^\s]+)/)
//   console.log({ amphoeMatch, amphoeMatch2 })

//   const provinceMatch = address.match(/จ\.([^\s]+)/)
//   const fProvinceMatch = address.match(/จังหวัด\.([^\s]+)/)
//   console.log({ provinceMatch, fProvinceMatch })

//   const zipcodeMatch = address.match(/\b\d{5}\b/)
//   console.log({ zipcodeMatch })

//   const mooMatch = address.match(/ม\.?\s*(\d+)/)
//   const fmooMatch = address.match(/หมู่\.?\s*(\d+)/)
//   console.log({ mooMatch, fmooMatch })
//   console.log(address.split('\n'))

//   console.log(address.substring(0, 59))
//   const taxId = address.match(/\b\d{13}\b/)
//   console.log({ taxId })
//   // const soiMatch = address.match(/ซอย\s*(\d+)/)
//   // const fsoiMatch = address.match(/ซอย\s*(\d+)/)
//   // const houseMatch = address.match(/^(\d+\s*ซอย\s*\d+\s*บ้าน[^\s]+)/)
//   // const fhouseMatch = address.match(/^(\d+\s*ซอย\s*\d+\s*บ้าน[^\s]+)/)

//   if (tambonMatch) return tambonMatch[1].trim()
//   if (tambonMatch2) return tambonMatch2[1].trim()

//   const result = {
//     tambon: tambonMatch?.[1]?.trim() || tambonMatch2?.[1]?.trim() || null
//   }
//   console.log({ result })

//   return null
// }

// export async function splitAddress(address: string) {
//   const data = address.split('\n')
//   console.log({ data })
// }

// const addressEng = 'Charles Space, 24/42 Chalermprakiet Rd, Moo. 5 Ratsada Mueang Phuket Phuket 83000'
// export async function extractFieldsNote(address: string) {
//   const [moo, tambon, amphoe, province, zipcode] = await Promise.all([extractFieldsMoo(address), extractFieldsTambon(address), extractFieldsAmphoe(address), extractFieldsProvince(address), extractFieldsZipcode(address)])

//   return {
//     moo,
//     tambon,
//     amphoe,
//     province,
//     zipcode
//   }
// }
