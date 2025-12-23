import fs from 'fs'
import { throwError } from '@/libs/ErrorService'
import { iFileOperationResponse } from '@/interfaces/FileSystem'

export const writeFileToLocalStorage = async (filePath: string, data: string): Promise<iFileOperationResponse> => {
  try {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, err => {
        if (err) {
          reject({ checker: false, message: err.message })
        } else {
          resolve({ checker: true, message: 'Write is successful' })
        }
      })
    })
  } catch (error) {
    throw throwError(error, 'writeFileToLocalStorage')
  }
}

export const readFileFromLocalStorage = async (filePath: string): Promise<Buffer> => {
  try {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  } catch (error) {
    throw throwError(error, 'readFileFromLocalStorage')
  }
}

export const deleteFileFromLocalStorage = async (filePath: string): Promise<iFileOperationResponse> => {
  try {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, err => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve({ checker: false, message: 'File not found, nothing to delete' })
          } else {
            reject({ checker: false, message: err.message })
          }
        } else {
          resolve({ checker: true, message: 'File deletion successful' })
        }
      })
    })
  } catch (error) {
    throw throwError(error, 'deleteFileFromLocalStorage')
  }
}
