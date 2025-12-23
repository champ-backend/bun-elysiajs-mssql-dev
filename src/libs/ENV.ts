import { promises as fs } from 'fs'
import path from 'path'
const env: string = process.env.NODE_ENV || 'development'

export const createEnvironmentVariables = async (): Promise<string> => {
  const jsonFilePath: string = path.join(__dirname, `../../config/${env.toLowerCase()}.json`)
  const data: string = await fs.readFile(jsonFilePath, 'utf8')
  const config: Record<string, any> = JSON.parse(data)
  let envContent: string = ''

  // Process server-related environment variables
  const serverName = 'SERVER'
  const dataKeyFilterServer = searchInObject(config, serverName.toLowerCase(), ['port'])
  for (const key in dataKeyFilterServer) {
    envContent += `${serverName}_${key.toUpperCase()}_ENV=${dataKeyFilterServer[key]}\n`
  }

  // Process database-related environment variables
  const database = 'DATABASE'
  const dataKeyFilter = searchInObject(config, database.toLowerCase(), ['host', 'port', 'type', 'name', 'username'])
  for (const key in dataKeyFilter) {
    envContent += `${database}_${key.toUpperCase()}_ENV=${dataKeyFilter[key]}\n`
  }

  const { type, host, port, username, password, name, poolAcquireTimeout, poolIdleTimeout, poolMax, poolMin } = config.database
  const urlSqlServer: string = `"${type}://${host}:${port};database=${name};username=${username};password=${password};trustServerCertificate=true;poolMax=${poolMax};poolMin=${poolMin};poolIdleTimeout=${poolIdleTimeout};poolAcquireTimeout=${poolAcquireTimeout}"\n`
  envContent += `DATABASE_URL=${urlSqlServer}`
  envContent += `NODE_ENV=${env}\n`

  // Write to .env file
  const envFilePath: string = path.join(__dirname, '../../.env')
  await fs.writeFile(envFilePath, envContent)
  return '.env file created successfully!'
}

// Function to search for a specific key in an object
function searchInObject(obj: Record<string, any>, targetKey: string, targetArray: string[] = []): Record<string, any> | null {
  for (let key in obj) {
    if (key === targetKey) {
      if (targetArray.length > 0 && typeof obj[key] === 'object') {
        const filteredObj = Object.keys(obj[key])
          .filter(k => targetArray.includes(k))
          .reduce((newObj, k) => {
            return { ...newObj, [k]: obj[targetKey][k] }
          }, {} as Record<string, any>)
        return filteredObj
      }
      return { [key]: obj[key] }
    } else if (typeof obj[key] === 'object') {
      let result = searchInObject(obj[key], targetKey, targetArray)
      if (result) {
        return result
      }
    }
  }

  return null
}
