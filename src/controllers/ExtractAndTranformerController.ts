import fs from 'fs'
import XLSX from 'xlsx'
import path from 'path'
import moment from 'moment'
import mime from 'mime-types'
import { toCamelCase, toSnakeCase, toPascalCase, toKebabCase, inferType } from '../libs/keyName'
import { throwError } from '@/libs/ErrorService'
import { iHeaderMapType, iSheetRow } from '@/interfaces/FileSystem'

type KeyCase = 'camelCase' | 'snakeCase' | 'pascalCase' | 'kebabCase' | 'original'

export class ExcelExtractorTransformer {
  filePath: string
  sheetIndex: number
  keyCase: KeyCase
  rawDataSheet: iSheetRow[]
  headerMap: iHeaderMapType

  constructor(filePath: string, sheetIndex: number = 1, keyCase: KeyCase = 'camelCase') {
    this.filePath = filePath
    this.sheetIndex = sheetIndex
    this.keyCase = keyCase
    this.rawDataSheet = []
    this.headerMap = {}
  }

  static excelDateToMSSQL(dateStr: string): string {
    const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/)
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`
    }
    return dateStr
  }

  static excelSerialToMSSQLDateWithMoment(serial: number): string {
    const excelEpoch = new Date(1899, 11, 30)
    const ms = excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
    const dateObj = new Date(ms)
    return moment(dateObj).format('YYYY-MM-DD HH:mm:ss')
  }

  static keyConverters: Record<KeyCase, (s: string) => string> = {
    camelCase: toCamelCase,
    snakeCase: toSnakeCase,
    pascalCase: toPascalCase,
    kebabCase: toKebabCase,
    original: s => s
  }

  async getHeaders(worksheet: XLSX.WorkSheet): Promise<string[]> {
    const range = XLSX.utils.decode_range(worksheet['!ref'] as string)
    const headers: string[] = []
    const firstRow = range.s.r
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = { c: C, r: firstRow }
      const cellRef = XLSX.utils.encode_cell(cellAddress)
      const cell = worksheet[cellRef]
      let hdr = cell ? cell.v : `__EMPTY_${C}`
      headers.push(hdr)
    }
    return headers
  }

  async createHeaderMap(headers: string[], samples: any[] | iSheetRow = []): Promise<iHeaderMapType> {
    const map: iHeaderMapType = {}
    const convert = ExcelExtractorTransformer.keyConverters[this.keyCase] || toCamelCase
    headers.forEach((header, idx) => {
      let sampleValue: any
      if (Array.isArray(samples)) {
        sampleValue = samples[idx]
      } else if (samples && typeof samples === 'object') {
        sampleValue = (samples as iSheetRow)[header]
      } else {
        sampleValue = undefined
      }
      map[header] = {
        keyName: convert(header),
        type: inferType(sampleValue)
      }
    })
    return map
  }

  async loadExcelFile(): Promise<{ rawDataSheet: iSheetRow[]; headerMap: iHeaderMapType }> {
    try {
      if (!fs.existsSync(this.filePath)) throw new Error(`File not found: ${this.filePath}`)
      let workbook: XLSX.WorkBook
      const mimeType = mime.lookup(this.filePath)
      if (mimeType === 'text/csv' || mimeType === 'text/plain') {
        const fileContent = fs.readFileSync(this.filePath, 'utf8')
        workbook = XLSX.read(fileContent, { type: 'string' })
      } else {
        workbook = XLSX.readFile(this.filePath)
      }
      const sheetName = workbook.SheetNames[this.sheetIndex - 1]
      const worksheet = workbook.Sheets[sheetName]
      if (!worksheet['!ref']) {
        throw new Error('Worksheet is empty or corrupted')
      }
      const headers = await this.getHeaders(worksheet)
      const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: null }) as iSheetRow[]
      this.headerMap = await this.createHeaderMap(headers, rawData[4] || [])
      this.rawDataSheet = rawData
      return { rawDataSheet: this.rawDataSheet, headerMap: this.headerMap }
    } catch (error: any) {
      throw throwError(error, 'ExcelExtractorTransformer.loadExcelFile')
    }
  }

  transformRow(rawData: iSheetRow, headerMap: iHeaderMapType): iSheetRow {
    interface iColumnConfig {
      keyName: string
      type: 'string' | 'number' | 'boolean' | 'datetime' | string
    }
    const mappedData: iSheetRow[] = (rawData as iSheetRow[]).map((row: iSheetRow) => {
      const mappedRow: iSheetRow = {}
      for (const headerKey in row) {
        const config = headerMap[headerKey] as iColumnConfig | undefined
        if (config) {
          let value: any = row[headerKey]
          switch (config.type) {
            case 'string':
              value = value ? String(value.trim()) : null
              break
            case 'number':
              value = value ? Number(value) : 0
              break
            case 'boolean':
              value = value === 'TRUE' || value === 'true' || value === true
              break
            case 'datetime':
              if (typeof value === 'number') {
                value = ExcelExtractorTransformer.excelSerialToMSSQLDateWithMoment(value as number)
              } else {
                const v = value as string
                value = moment(v, 'DD.MM.YYYY').isValid() ? moment(v, 'DD.MM.YYYY').format('YYYY-MM-DD') : String(value)
              }
              break
          }
          mappedRow[config.keyName] = value === '' ? null : value
        }
      }
      return mappedRow
    })
    return mappedData
  }

  async RunLoadExcelFile(): Promise<{ rawDataSheet: iSheetRow[]; headerMap: iHeaderMapType }> {
    const excelFile = await this.loadExcelFile()
    return excelFile
  }

  async RunMapDataTransform(rowData: iSheetRow, headerMap: iHeaderMapType): Promise<iSheetRow> {
    return this.transformRow(rowData, headerMap)
  }
}

export default ExcelExtractorTransformer
