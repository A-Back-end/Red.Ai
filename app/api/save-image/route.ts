import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// Функция для скачивания изображения по URL и сохранения его локально
export async function POST(request: NextRequest) {
  try {
    console.log('💾 Starting image download and save process...')
    
    const body = await request.json()
    const { imageUrl, filename } = body
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Создаем папку для сохранения изображений, если её нет
    const saveDir = path.join(process.cwd(), 'public', 'generated-images')
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true })
    }

    // Генерируем уникальное имя файла, если не предоставлено
    const timestamp = Date.now()
    const finalFilename = filename || `generated-image-${timestamp}.png`
    const filePath = path.join(saveDir, finalFilename)

    console.log('📥 Downloading image from:', imageUrl)
    
    // Скачиваем изображение
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }

    // Получаем данные изображения
    const imageBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)

    // Сохраняем изображение в локальную папку
    fs.writeFileSync(filePath, buffer)

    // Возвращаем локальный URL
    const localUrl = `/generated-images/${finalFilename}`
    
    console.log('✅ Image saved successfully to:', localUrl)
    
    return NextResponse.json({
      success: true,
      originalUrl: imageUrl,
      localUrl: localUrl,
      filename: finalFilename,
      message: 'Image downloaded and saved successfully'
    })

  } catch (error) {
    console.error('❌ Error downloading and saving image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to download and save image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 