import { spawn } from 'child_process'
import path from 'path'

class PythonServerManager {
  private static instance: PythonServerManager
  private serverProcess: any = null
  private isStarting: boolean = false

  private constructor() {}

  static getInstance(): PythonServerManager {
    if (!PythonServerManager.instance) {
      PythonServerManager.instance = new PythonServerManager()
    }
    return PythonServerManager.instance
  }

  async startServer(): Promise<void> {
    if (this.serverProcess || this.isStarting) {
      return
    }

    this.isStarting = true
    console.log('Starting Python server...')

    try {
      // Get the path to the backend directory
      const backendPath = path.join(process.cwd(), '..', 'backend')
      const pythonScript = path.join(backendPath, 'main_2.py')

      // Start the Python server
      this.serverProcess = spawn('python', [pythonScript], {
        cwd: backendPath,
        stdio: 'pipe'
      })

      // Log server output
      this.serverProcess.stdout.on('data', (data: Buffer) => {
        console.log(`Server output: ${data}`)
      })

      this.serverProcess.stderr.on('data', (data: Buffer) => {
        console.error(`Server error: ${data}`)
      })

      // Wait for server to start
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log('Python server started successfully')
    } catch (error) {
      console.error('Failed to start Python server:', error)
      throw error
    } finally {
      this.isStarting = false
    }
  }

  async ensureServerRunning(): Promise<void> {
    try {
      const response = await fetch('http://localhost:8000/health')
      if (!response.ok) {
        await this.startServer()
      }
    } catch {
      await this.startServer()
    }
  }
}

export const pythonServer = PythonServerManager.getInstance() 