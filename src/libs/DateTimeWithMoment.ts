import { throwError } from '@/libs/ErrorService'
import moment from 'moment'

export async function createDateAndTimeObject(searchStart: string, searchEnd: string, orderBy: string): Promise<{ where: object }> {
  try {
    const startDate = moment(searchStart, moment.ISO_8601, true)
    const endDate = moment(searchEnd, moment.ISO_8601, true)
    if (!startDate.isValid() || !endDate.isValid()) {
      return { where: {} }
    }

    const where = {
      [orderBy]: {
        gte: startDate.toDate(),
        lte: endDate.toDate()
      }
    }

    return { where }
  } catch (error) {
    throw throwError(error, 'createDateAndTimeObject')
  }
}

// export const parseDateWithMoment = (date: string | null) => (['-', null, ''].includes(date) ? null : moment(date, 'YYYY-MM-DD HH:mm', true).isValid() ? moment(date, 'YYYY-MM-DD HH:mm').format() : null)

export const formatDateForMSSQL = (datetimeString: string) => {
  const parsedDate = moment(datetimeString, 'DD/MM/YYYY HH:mm:ss', true)
  if (!parsedDate.isValid()) {
    throw new Error('Invalid date format. Expected format: DD/MM/YYYY HH:mm:ss')
  }
  return parsedDate.toISOString()
}

function isExcelSerialDate(value: string | null | undefined): value is string {
  // ตรวจสอบว่า value เป็นจำนวนจริงที่มากกว่า 0
  if (value === null || value === undefined || value === '') return false
  return /^\d+(\.\d+)?$/.test(value)
}

function excelSerialToMoment(serial: string) {
  // Excel วันที่เริ่มคือ 1899-12-30
  const baseDate = moment('1899-12-30')
  const floatVal = parseFloat(serial)
  // ส่วนที่เป็นเลขทศนิยมคือเวลาในวันนั้น
  const days = Math.floor(floatVal)
  const timeFraction = floatVal - days
  const m = baseDate
    .clone()
    .add(days, 'days')
    .add(timeFraction * 24, 'hours')
  return m
}

export const parseDateWithMoment = (date: string | null) => {
  if (['-', null, ''].includes(date)) return null
  const formats = ['YYYY-MM-DD HH:mm', 'DD-MM-YY HH:mm']
  if (isExcelSerialDate(date)) {
    const m = excelSerialToMoment(date)
    return m.isValid() ? m.format() : null // เช่น m.format('YYYY-MM-DD HH:mm')
  }

  const m = moment(date, formats, true)
  console.log({ m })
  return m.isValid() ? m.format() : null
}
