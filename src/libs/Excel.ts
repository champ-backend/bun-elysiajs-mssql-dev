import moment from 'moment'

export const excelSerialDateToMoment = (serial: number) => {
  const excelEpoch = moment.utc('1899-12-30')
  const days = Math.floor(serial)
  const fraction = serial - days
  const totalSeconds = Math.round(fraction * 86400)
  return excelEpoch.add(days, 'days').add(totalSeconds, 'seconds')
}
