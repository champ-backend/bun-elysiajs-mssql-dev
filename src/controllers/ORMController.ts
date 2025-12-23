import chalk from 'chalk'
import { PrismaClient } from '@prisma/client'
import { throwError } from '@/libs/ErrorService'

const prisma = new PrismaClient()

export const initializeDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect()
    console.log(chalk.greenBright('✅ Database connection successful!   ▄︻テ══━一💥 '))
    console.log('===================================================')
    console.log('📦 Database MSSQL:', chalk.greenBright(process.env.DATABASE_NAME_ENV || 'NOT SET'))
    console.log('👤 Username:', chalk.cyan(process.env.DATABASE_USERNAME_ENV || 'NOT SET'))
    console.log('🌍 Host:', chalk.yellow(process.env.DATABASE_HOST_ENV || 'NOT SET'))
    console.log('🚪 Port:', chalk.gray(process.env.DATABASE_PORT_ENV || 'NOT SET'))
    console.log('===================================================')
  } catch (error) {
    console.error(chalk.redBright('❌ Unable to connect to the database:'), error)
    await prisma.$disconnect()
    throw throwError(error, 'Error initializeDatabase')
  }
}
