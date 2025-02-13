import { NextResponse } from 'next/server'
import { exec, ExecOptions } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

const PYTHON_PATH = 'C:\\Python311\\python.exe' // Temporary hardcode for testing

export async function GET() {
  try {
    // First check if server is already running
    try {
      const response = await fetch('http://localhost:8000/health')
      if (response.ok) {
        console.log('Server is already running')
        return NextResponse.json({ status: 'running' })
      }
    } catch {
      console.log('Server is not running, attempting to start...')
    }

    // Server not running, try to start it
    try {
      const backendPath = path.join(process.cwd(), '..', 'backend')
      const pythonScript = path.join(backendPath, 'main_2.py')
      
      const command = `"${PYTHON_PATH}" "${pythonScript}"`

      console.log('Starting Python server...')
      console.log('Command:', command)
      console.log('Working directory:', backendPath)

      const execOptions = {
        cwd: backendPath,
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        windowsHide: false
      } as ExecOptions

      const { stdout, stderr } = await execAsync(command, execOptions)

      if (stderr) {
        console.error('Python server stderr:', stderr)
      }
      if (stdout) {
        console.log('Python server stdout:', stdout)
      }

      // Wait for server to start
      console.log('Waiting for server to start...')
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        try {
          const healthCheck = await fetch('http://localhost:8000/health')
          if (healthCheck.ok) {
            console.log('Server started successfully')
            return NextResponse.json({ status: 'started' })
          }
        } catch {
          // Server not ready yet
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }

      throw new Error('Server failed to start after multiple attempts')

    } catch (error: any) {
      console.error('Failed to start Python server:', error)
      const errorMessage = error?.message || 'Unknown error occurred'
      
      return NextResponse.json(
        { 
          status: 'error', 
          message: errorMessage,
          details: {
            error: error.toString(),
            stack: error.stack,
            command: error.cmd,
            stdout: error.stdout,
            stderr: error.stderr
          }
        }, 
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Unexpected error occurred',
        details: error.toString()
      }, 
      { status: 500 }
    )
  }
} 