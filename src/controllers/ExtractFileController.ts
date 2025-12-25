import { throwError } from '@/libs/ErrorService'
import { extractFileConfig } from '@/pref/ExtractFile'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import { object } from 'zod'
import { Param } from '@prisma/client/runtime/library'
import ExcelExtractorTransformer from './ExtractAndTranformerController'
import { iHeaderMapType } from '@/interfaces/FileSystem'

async function checkDataPlatform(rawHeaders: string[]) {
  try {
    console.log({ tiktok: extractFileConfig.tiktok.stringHeaderMapping })

    const platforms = {
      shopify: extractFileConfig.shopify.stringHeaderMapping,
      shopee: extractFileConfig.shopee.stringHeaderMapping,
      tiktok: extractFileConfig.tiktok.stringHeaderMapping,
      product_master: extractFileConfig.productMaster.stringHeaderMapping
    }

    let detectedPlatform: string | null = null
    let matchedHeaders: string[] = []
    let missingHeaders: string[] = []
    let extraHeaders: string[] = []
    let matchPercentage = 0

    for (const [platform, expectedHeaders] of Object.entries(platforms)) {
      const matched = rawHeaders.filter(header => expectedHeaders.includes(header))
      const percentage = (matched.length / expectedHeaders.length) * 100
      console.log(`-->Platform: ${platform}, Match Percentage: ${percentage.toFixed(2)}%`)
      if (percentage >= 90) {
        detectedPlatform = platform
        matchedHeaders = matched
        missingHeaders = expectedHeaders.filter(header => !rawHeaders.includes(header))
        extraHeaders = rawHeaders.filter(header => !expectedHeaders.includes(header))
        matchPercentage = percentage
        break
      }
    }

    if (!detectedPlatform) return { isValid: false, detectedPlatform: null, matchPercentage: 0, missingHeaders: [], extraHeaders: [], matchedHeaders: [] }
    return { isValid: true, detectedPlatform, matchPercentage, missingHeaders, extraHeaders, matchedHeaders }
  } catch (error) {
    throw new Error(`checkDataPlatform Error: ${error}`)
  }
}

export const checkFileExcelHeaderTypePlatform = async (excelFilePath: string): Promise<{ data: object }> => {
  try {
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`File not found: ${excelFilePath}`)
    }
    const workbook = XLSX.readFile(excelFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName] as XLSX.WorkSheet
    if (!worksheet['!ref']) {
      throw new Error('Worksheet is empty or corrupted')
    }
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    const rawHeaders: string[] = jsonData[0] || [1]
    const dataResponse = await checkDataPlatform(rawHeaders)
    return { data: dataResponse }
  } catch (error) {
    throw throwError(error, 'checkFileExcelHeaderTypePlatform')
  }
}

export const processExtractAndAnalysisShopifyOrder = async (excelFilePath: string): Promise<{ data: any[] }> => {
  try {
    const { objectColumnMapping, stringColumnMapping, numberColumnMapping } = extractFileConfig.shopify
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`File not found: ${excelFilePath}`)
    }

    const workbook = XLSX.readFile(excelFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName] as XLSX.WorkSheet
    const extractedData = []
    const startingRow = 2
    if (!worksheet['!ref']) {
      throw new Error('Worksheet is empty or corrupted')
    }

    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let rowNum = startingRow; rowNum <= range.e.r + 1; rowNum++) {
      const row: any = {}
      Object.keys(objectColumnMapping).forEach(column => {
        const cellAddress = column + rowNum
        const cell = worksheet[cellAddress] as XLSX.CellObject | undefined
        const columnMap = objectColumnMapping[column]
        if (cell) {
          if (stringColumnMapping.includes(column)) {
            row[`${columnMap}`] = String(cell.v)
          } else if (numberColumnMapping.includes(column)) {
            row[`${columnMap}`] = Number(cell.v)
          }
        } else {
          row[`${columnMap}`] = null
        }
      })
      extractedData.push(row)
    }

    return { data: extractedData }
  } catch (error) {
    throw throwError(error, 'processExtractAndAnalysisShopifyOrder')
  }
}

export const processExtractAndAnalysisShopeeOrder = async (excelFilePath: string): Promise<{ data: any[] }> => {
  try {
    const { objectColumnMapping, stringColumnMapping, numberColumnMapping } = extractFileConfig.shopee
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`File not found: ${excelFilePath}`)
    }

    const workbook = XLSX.readFile(excelFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName] as XLSX.WorkSheet
    const extractedData = []
    const startingRow = 2

    if (!worksheet['!ref']) {
      throw new Error('Worksheet is empty or corrupted')
    }
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let rowNum = startingRow; rowNum <= range.e.r + 1; rowNum++) {
      const row: any = {}
      Object.keys(objectColumnMapping).forEach(column => {
        const cellAddress = column + rowNum
        const cell = worksheet[cellAddress] as XLSX.CellObject | undefined
        const columnMap = objectColumnMapping[column]
        if (cell) {
          if (stringColumnMapping.includes(column)) {
            row[`${columnMap}`] = String(cell.v)
          } else if (numberColumnMapping.includes(column)) {
            row[`${columnMap}`] = Number(cell.v)
          }
        } else {
          row[`${columnMap}`] = null
        }
      })

      extractedData.push(row)
    }

    return { data: extractedData }
  } catch (error) {
    throw throwError(error, 'processExtractAndAnalysisShopeeOrder')
  }
}

export const processExtractAndAnalysisProductMaster = async (excelFilePath: string): Promise<{ data: any[] }> => {
  try {
    const { objectColumnMapping, stringColumnMapping, numberColumnMapping } = extractFileConfig.productMaster
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`File not found: ${excelFilePath}`)
    }

    const workbook = XLSX.readFile(excelFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName] as XLSX.WorkSheet
    const extractedData = []
    const startingRow = 2

    if (!worksheet['!ref']) {
      throw new Error('Worksheet is empty or corrupted')
    }
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let rowNum = startingRow; rowNum <= range.e.r + 1; rowNum++) {
      const row: any = {}
      Object.keys(objectColumnMapping).forEach(column => {
        const cellAddress = column + rowNum
        const cell = worksheet[cellAddress] as XLSX.CellObject | undefined
        const columnMap = objectColumnMapping[column]
        if (cell) {
          if (stringColumnMapping.includes(column)) {
            row[`${columnMap}`] = String(cell.v).replace(/["']/g, '')
          } else if (numberColumnMapping.includes(column)) {
            row[`${columnMap}`] = Number(cell.v)
          }
        } else {
          row[`${columnMap}`] = null
        }
      })

      extractedData.push(row)
    }

    return { data: extractedData }
  } catch (error) {
    throw throwError(error, 'processExtractAndAnalysisProductMaster')
  }
}



export const extractedDataExcelDemo = async () => {
  try {
    const excelFilePath = './store/ftai/20250822/FTAI_MIDDLEWARE1755860735149.xlsx'
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`File not found: ${excelFilePath}`)
    }
    const workbook = XLSX.readFile(excelFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName] as XLSX.WorkSheet
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet)
    type FieldType = 'string' | 'number' | 'boolean' | 'datetime'
    const headerMap: Record<string, { keyName: string; type: FieldType }> = {
      Name: { keyName: 'name', type: 'string' },
      Email: { keyName: 'email', type: 'string' },
      'Financial Status': { keyName: 'financialStatus', type: 'string' },
      'Paid at': { keyName: 'paidAt', type: 'datetime' },
      'Fulfillment Status': { keyName: 'fulfillmentStatus', type: 'string' },
      'Fulfilled at': { keyName: 'fulfilledAt', type: 'string' },
      'Accepts Marketing': { keyName: 'acceptsMarketing', type: 'string' },
      Currency: { keyName: 'currency', type: 'string' },
      Subtotal: { keyName: 'subtotal', type: 'number' },
      Shipping: { keyName: 'shipping', type: 'number' },
      Taxes: { keyName: 'taxes', type: 'number' },
      Total: { keyName: 'total', type: 'number' },
      'Discount Code': { keyName: 'discountCode', type: 'string' },
      'Discount Amount': { keyName: 'discountAmount', type: 'number' },
      'Shipping Method': { keyName: 'shippingMethod', type: 'string' },
      'Created at': { keyName: 'createdAt', type: 'datetime' },
      'Lineitem quantity': { keyName: 'lineitemQuantity', type: 'number' },
      'Lineitem name': { keyName: 'lineitemName', type: 'string' },
      'Lineitem price': { keyName: 'lineitemPrice', type: 'number' },
      'Lineitem compare at price': { keyName: 'lineitemCompareAtPrice', type: 'number' },
      'Lineitem sku': { keyName: 'lineitemSku', type: 'number' },
      'Lineitem requires shipping': { keyName: 'lineitemRequiresShipping', type: 'boolean' },
      'Lineitem taxable': { keyName: 'lineitemTaxable', type: 'boolean' },
      'Lineitem fulfillment status': { keyName: 'lineitemFulfillmentStatus', type: 'string' },
      'Billing Name': { keyName: 'billingName', type: 'string' },
      'Billing Street': { keyName: 'billingStreet', type: 'string' },
      'Billing Address1': { keyName: 'billingAddress1', type: 'string' },
      'Billing Address2': { keyName: 'billingAddress2', type: 'string' },
      'Billing Company': { keyName: 'billingCompany', type: 'string' },
      'Billing City': { keyName: 'billingCity', type: 'string' },
      'Billing Zip': { keyName: 'billingZip', type: 'string' },
      'Billing Province': { keyName: 'billingProvince', type: 'string' },
      'Billing Country': { keyName: 'billingCountry', type: 'string' },
      'Billing Phone': { keyName: 'bullingPhone', type: 'string' },
      'Shipping Name': { keyName: 'shippingName', type: 'string' },
      'Shipping Street': { keyName: 'shippingStreet', type: 'string' },
      'Shipping Address1': { keyName: 'shippingAddress1', type: 'string' },
      'Shipping Address2': { keyName: 'shippingAddress2', type: 'string' },
      'Shipping Company': { keyName: 'shippingCompany', type: 'string' },
      'Shipping City': { keyName: 'shippingCity', type: 'string' },
      'Shipping Zip': { keyName: 'shippingZip', type: 'string' },
      'Shipping Province': { keyName: 'shippingProvince', type: 'string' },
      'Shipping Country': { keyName: 'shippingCountry', type: 'string' },
      'Shipping Phone': { keyName: 'shippingPhone', type: 'string' },
      Notes: { keyName: 'notes', type: 'string' },
      'Note Attributes': { keyName: 'noteAttributes', type: 'string' },
      'Cancelled at': { keyName: 'cancelledAt', type: 'string' },
      'Payment Method': { keyName: 'paymentMethod', type: 'string' },
      'Payment Reference': { keyName: 'paymentReference', type: 'string' },
      'Refunded Amount': { keyName: 'refundedAmount', type: 'number' },
      Vendor: { keyName: 'vendor', type: 'string' },
      'Outstanding Balance': { keyName: 'outstanding', type: 'number' },
      Employee: { keyName: 'employee', type: 'string' },
      Location: { keyName: 'location', type: 'string' },
      'Device ID': { keyName: 'deviceId', type: 'string' },
      Id: { keyName: 'id', type: 'number' },
      Tags: { keyName: 'tags', type: 'string' },
      'Risk Level': { keyName: 'riskLevel', type: 'string' },
      Source: { keyName: 'source', type: 'string' },
      'Lineitem discount': { keyName: 'lineitemDiscount', type: 'number' },
      'Tax 1 Name': { keyName: 'tax1Name', type: 'string' },
      'Tax 1 Value': { keyName: 'tax1Value', type: 'string' },
      'Tax 2 Name': { keyName: 'tax2Name', type: 'string' },
      'Tax 2 Value': { keyName: 'tax2Value', type: 'string' },
      'Tax 3 Name': { keyName: 'tax3Name', type: 'string' },
      'Tax 3 Value': { keyName: 'tax3Value', type: 'string' },
      'Tax 4 Name': { keyName: 'tax4Name', type: 'string' },
      'Tax 4 Value': { keyName: 'tax4Value', type: 'string' },
      'Tax 5 Name': { keyName: 'tax5Name', type: 'string' },
      'Tax 5 Value': { keyName: 'tax5Value', type: 'string' },
      Phone: { keyName: 'phone', type: 'string' },
      'Receipt Number': { keyName: 'receiptNumber', type: 'string' },
      Duties: { keyName: 'duties', type: 'string' },
      'Billing Province Name': { keyName: 'billingProvinceName', type: 'string' },
      'Shipping Province Name': { keyName: 'shippingProvinceName', type: 'string' },
      'Payment ID': { keyName: 'paymentId', type: 'string' },
      'Payment Terms Name': { keyName: 'paymentTermsName', type: 'string' },
      'Next Payment Due At': { keyName: 'nextPaymentDueAt', type: 'string' },
      'Payment References': { keyName: 'paymentReferences', type: 'string' }
    }

    const mappedData = rawData.map(row => {
      const mappedRow: any = {}
      for (const headerKey in row) {
        const config = headerMap[headerKey]
        if (config) {
          let value = row[headerKey]
          switch (config.type) {
            case 'string':
              value = String(value)
              break
            case 'number':
              value = Number(value)
              break
            case 'boolean':
              value = value === 'TRUE' || value === 'true' || value === true
              break
          }
          mappedRow[config.keyName] = value
        }
      }
      return mappedRow
    })
    // console.log({ mappedData })
    // console.log({ length: mappedData.length })
    return mappedData
  } catch (error) {
    throw throwError(error, 'extractedDataExcelDemo')
  }
}

async function mergeByName(data: object[]) {
  const referenceMap: any = {}
  return data.map((item: any) => {
    const name = item.name
    console.log({ item })
    console.log('##=====>', { ref: referenceMap[name] })
    if (!referenceMap[name]) {
      referenceMap[name] = item
      return item
    }
    const ref = referenceMap[name]
    const merged = { ...ref, ...item }
    return merged
  })
}
