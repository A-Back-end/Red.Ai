import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    // Проверяем доступность файловой системы
    const saveDir = path.join(process.cwd(), 'public', 'generated-images')
    const canWrite = fs.existsSync(saveDir) && fs.statSync(saveDir).isDirectory()
    
    // Проверяем переменные окружения
    const hasEnvFile = fs.existsSync(path.join(process.cwd(), '.env'))
    
    // Проверяем доступность папки uploads
    const uploadsDir = path.join(process.cwd(), 'uploads')
    const uploadsExists = fs.existsSync(uploadsDir)
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        fileSystem: {
          saveDirectory: canWrite,
          uploadsDirectory: uploadsExists,
          envFile: hasEnvFile
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 