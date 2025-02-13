import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

export function getPythonPath(): string {
  // First check if PYTHON_PATH is set in environment
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH
  }

  try {
    // Try to get Python path using 'where' command on Windows or 'which' on Unix
    const command = process.platform === 'win32' ? 'where python' : 'which python'
    const pythonPath = execSync(command).toString().split('\n')[0].trim()
    
    if (pythonPath && fs.existsSync(pythonPath)) {
      return pythonPath
    }
  } catch {
    // If 'where/which' fails, try common installation paths
    const commonPaths = process.platform === 'win32' 
      ? [
          'C:\\Python311\\python.exe',
          'C:\\Python310\\python.exe',
          'C:\\Python39\\python.exe',
          'C:\\Python38\\python.exe',
          'C:\\Program Files\\Python311\\python.exe',
          'C:\\Program Files\\Python310\\python.exe',
          'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\Python\\Python311\\python.exe',
        ]
      : [
          '/usr/bin/python3',
          '/usr/local/bin/python3',
          '/usr/bin/python'
        ]

    for (const pythonPath of commonPaths) {
      if (fs.existsSync(pythonPath)) {
        return pythonPath
      }
    }
  }

  // If all else fails, try 'python' and hope it's in PATH
  return 'python'
} 