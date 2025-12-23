import { iContextParamsPagination } from '@/interfaces/Context'
import { iExportHistory } from '@/interfaces/ExportHistories'
import { createDateAndTimeObject } from '@/libs/DateTimeWithMoment'
import { throwError } from '@/libs/ErrorService'
import { countExportHistories, createExportHistories, findExportHistories } from '@/models/ExportHistories'
import { findAndIncludeOrderTransaction } from '@/models/OrderTransaction'
import moment from 'moment'

export const createLogsExportOrderTransactions = async (params: any, userId: number) => {
  try {
    const transactionsId = params.map((transaction: any) => transaction.id)
    await createExportHistories({ User: { connect: { id: userId } }, transactions: JSON.stringify(transactionsId) })
  } catch (error) {
    throw throwError(error, 'createLogsExportOrderTransactions')
  }
}

export const checkLogsExportTransactions = async (record: number[]): Promise<{ data: number[] }> => {
  try {
    const startOfCurrentMonth = moment().startOf('month').format()
    const endOfCurrentMonth = moment().endOf('month').format()
    const { where: whereDateAndTime } = await createDateAndTimeObject(startOfCurrentMonth, endOfCurrentMonth, 'createdAt')
    const { data: exportHistoryData } = await findExportHistories({ ...whereDateAndTime }, { limit: 100000, offset: 1, order: 'createdAt', sort: 'desc' })
    const allTransactions = exportHistoryData.map((obj: any) => JSON.parse(obj.transactions)).flat()
    const uniqueTransactions = [...new Set(allTransactions)]
    const duplicates = record.filter(value => uniqueTransactions.includes(value))
    return { data: duplicates }
  } catch (error) {
    throw throwError(error, 'checkLogsExportTransactions')
  }
}

export const listsExportHistoryPagination = async (params: iContextParamsPagination, query: object, information: object): Promise<{ data: any[]; count: number }> => {
  try {
    const { limit, offset, sort, order } = params
    const { searchStart, searchEnd, userId, username, firstname, lastname, search } = query as iExportHistory
    const { where: whereDateAndTime } = await createDateAndTimeObject(searchStart, searchEnd, order)
    const searchQuery = {
      ...(search && {
        OR: [{ User: { username: { contains: search } } }, { User: { firstname: { contains: search } } }, { User: { lastname: { contains: search } } }]
      })
    }
    const where = {
      ...whereDateAndTime,
      ...searchQuery,
      ...(userId && { userId: +userId }),
      ...(username && { User: { username: { contains: username } } }),
      ...(firstname && { User: { firstname: { contains: firstname } } }),
      ...(lastname && { User: { lastname: { contains: lastname } } })
    }
    const data: any[] = []
    const { data: dataHistory, count } = await findExportHistories(where, { limit, offset, order, sort })
    for (let index = 0; index < dataHistory.length; index++) {
      const { transactions, User, ...res } = dataHistory[index]
      const pTransactions = JSON.parse(transactions)
      const where = { id: { in: pTransactions } }
      const { data: dataTransactions } = await findAndIncludeOrderTransaction(where)
      if (dataTransactions.length) {
        const transactions = dataTransactions.map((obj: any) => ({ ...obj, accountCode: obj.accountCode.toString() }))
        data.push({ ...res, transactions: pTransactions, details: transactions, userDetail: User })
      }
    }
    console.log(JSON.stringify(data, null, 2))
    return { data, count }
  } catch (error) {
    throw throwError(error, 'listsHistoryPagination')
  }
}
