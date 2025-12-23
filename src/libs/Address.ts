//   BI: 'invoiceFullAddress', //ที่อยู่สำหรับออกใบกำกับภาษีแบบเต็มรูป
//   BJ: 'invoiceAddressDetails', //รายละเอียดที่อยู่
//   BK: 'invoiceSubDistrict', //แขวง/ตำบล
//   BL: 'invoiceDistrict', //เขต/อำเภอ
//   BM: 'invoiceProvince', //จังหวัด
function splitByLength(str: string, length: number): object {
  const words = str.split(' ')
  let part1 = ''
  let part2 = ''

  for (let i = 0; i < words.length; i++) {
    const testPart = (part1 ? part1 + ' ' : '') + words[i]
    if (testPart.length > length) {
      part2 = words.slice(i).join(' ')
      break
    } else {
      part1 = testPart
    }
  }
  if (!part2) part2 = ''
  return { address: part1.trim(), address2: part2.trim() }
}

export async function splitNameAndCheckInvoiceType(invoiceType: string, name: string) {
  console.log({ invoiceType, name })
  const beforeIndex = name.indexOf('(สำนักงานใหญ่)')
  console.log({ beforeIndex })

  let arr: string[]
  if (beforeIndex !== -1) {
    arr = [name.slice(0, beforeIndex).trim(), name.slice(beforeIndex).trim()]
  } else {
    arr = [name]
  }
  console.log({ arr })
  const { address: name1, address2: name2 } = splitByLength(arr[0], 35) as { address: string; address2: string }
  return { name1: `${name1} `, name2 }
}

export async function splitAddressWithInvoiceSubDistrict(invoiceFullAddress: string, invoiceSubDistrict: string): Promise<{ address: string; address2: string }> {
  const beforeIndex = invoiceFullAddress.indexOf(invoiceSubDistrict)
  let arr: string[]
  if (beforeIndex !== -1) {
    arr = [invoiceFullAddress.slice(0, beforeIndex).trim(), invoiceFullAddress.slice(beforeIndex).trim()]
  } else {
    arr = [invoiceFullAddress]
  }
  const { address, address2 } = splitByLength(arr[0], 25) as { address: string; address2: string }
  return { address: `${address} `, address2 }
}

export async function splitAddressWithShippingAddress(invoiceFullAddress: string): Promise<{ address: string; address2: string }> {
  const addressResult = await removeDuplicateSegments(invoiceFullAddress)
  const shippingDistrict = 'เขต'
  const shippingDistrictCase2 = 'อำเภอ'
  const beforeIndex = addressResult.indexOf(shippingDistrict)
  const beforeIndex2 = addressResult.indexOf(shippingDistrictCase2)
  let arr: string[]
  if (beforeIndex !== -1) {
    arr = [addressResult.slice(0, beforeIndex).trim(), addressResult.slice(beforeIndex).trim()]
  } else if (beforeIndex2 !== -1) {
    arr = [addressResult.slice(0, beforeIndex2).trim(), addressResult.slice(beforeIndex2).trim()]
  } else {
    arr = [addressResult]
  }
  const { address, address2 } = splitByLength(arr[0], 35) as { address: string; address2: string }
  return { address: `${address} `, address2 }
}

async function removeDuplicateSegments(text: string): Promise<string> {
  // แยกสตริงด้วยเว้นวรรค
  const tokens = text.trim().split(/\s+/)
  // console.log({ tokens })
  // console.log('tokensLength :', tokens.length)
  // เก็บผลลัพธ์ทีละที
  let resultTokens: string[] = []
  let i = 0
  while (i < tokens.length) {
    // console.log('============= while loop ===========')
    let foundDuplicate = false
    // เช็คชุดคำต่อไปว่าจะมีซ้ำในส่วนที่เหลือบ้างไหม
    // โดยวนเช็คขนาดชุดคำที่ยาวที่สุดเท่าที่จะเป็นไปได้
    for (let length = Math.min(tokens.length - i, tokens.length); length > 0; length--) {
      const segment = tokens.slice(i, i + length).join(' ')
      // หา segment ซ้ำในส่วน tokens[i + length ...]
      const remaining = tokens.slice(i + length).join(' ')
      // console.log('XX', remaining.includes(segment))
      if (remaining.includes(segment)) {
        // ถ้าพบซ้ำ ให้ข้าม segment นี้ไปเลย (ไม่เก็บซ้ำ)
        // คือไม่เก็บ segment และข้ามไปตำแหน่ง i + length
        i += length
        foundDuplicate = true
        break
      }
      // console.log({ segment, remaining, resultTokens })
    }
    if (!foundDuplicate) {
      // ถ้าไม่พบซ้ำเลย แค่เก็บ token ตัวนี้ แล้วเลื่อนไป 1
      resultTokens.push(tokens[i])
      i++
    }
    // console.log('===================END====================== INDEX :', i)
  }
  return resultTokens.join(' ')
}

function removeAfterKeyword(text: string, keywords: string[]) {
  for (const keyword of keywords) {
    const matchIndex = text.indexOf(keyword)
    if (matchIndex !== -1) {
      text = text.substring(0, matchIndex).trim()
      console.log({ text })
      break
    }
  }
  return text
}

export async function splitAddressShopifyWithNoteAttributes(noteAttributes: string, invoiceSubDistrict: string): Promise<{ address: string; address2: string }> {
  const keywords = [`แขวง${invoiceSubDistrict}`, `ตำบล${invoiceSubDistrict}`, `ข.${invoiceSubDistrict}`, `ต.${invoiceSubDistrict}`, `${invoiceSubDistrict}`]
  const result = removeAfterKeyword(noteAttributes, keywords)
  const { address, address2 } = splitByLength(result, 30) as { address: string; address2: string }
  console.log({ address, address2 })
  return { address: `${address} `, address2 }
}

export async function splitNameAndCheckInvoiceTypeShopify(name: string) {
  const { address: name1, address2: name2 } = splitByLength(name, 30) as { address: string; address2: string }
  return { name1: `${name1} `, name2 }
}

export async function splitAddressShopify(name: string) {
  const { address, address2 } = splitByLength(name, 35) as { address: string; address2: string }
  return { address, address2 }
}

export async function splitNameAndCheckInvoiceTypeShopee(name: string) {
  const { address: name1, address2: name2 } = splitByLength(name, 30) as { address: string; address2: string }
  return { name1: `${name1} `, name2 }
}

export async function splitNameChannalTiktok(name: string) {
  const { address: name1, address2: name2 } = splitByLength(name, 30) as { address: string; address2: string }
  return { name1: `${name1} `, name2 }
}

export async function splitAddressChannalTiktok(name: string) {
  const { address, address2 } = splitByLength(name, 35) as { address: string; address2: string }
  return { address, address2 }
}
