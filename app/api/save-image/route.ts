import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { getS3Service } from '@/lib/s3-service'

// Функция для скачивания изображения по URL и сохранения его в облачное хранилище (S3) или локально как fallback
export async function POST(request: NextRequest) {
  try {
    console.log('💾 Starting image download and save process...')
    
    const body = await request.json()
    const { imageUrl, filename } = body
    
    if (!imageUrl) {
      console.error('❌ Image URL is required')
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    console.log('📥 Processing image URL:', imageUrl)

    // Пытаемся использовать S3 для загрузки
    const s3Service = getS3Service()
    
    if (s3Service && s3Service.isConfigured()) {
      console.log('☁️ Using AWS S3 for image storage...')
      
      try {
        // Загружаем изображение в S3
        const uploadResult = await s3Service.uploadImage(imageUrl, filename)
        
        if (uploadResult.success) {
          console.log('✅ Image uploaded to S3 successfully:', uploadResult.publicUrl)
          
          return NextResponse.json({
            success: true,
            originalUrl: imageUrl,
            localUrl: uploadResult.publicUrl, // Теперь это S3 URL
            filename: uploadResult.filename,
            s3Key: uploadResult.s3Key,
            storageType: 's3',
            message: 'Image downloaded and uploaded to S3 successfully'
          })
        } else {
          console.warn('⚠️ S3 upload failed, falling back to local storage:', uploadResult.error)
        }
      } catch (s3Error) {
        console.warn('⚠️ S3 upload error, falling back to local storage:', s3Error)
      }
    } else {
      console.log('⚠️ S3 not configured, using local storage as fallback')
    }

    // Fallback: сохраняем локально, если S3 недоступен
    console.log('📁 Using local storage as fallback...')

    // Создаем папку для сохранения изображений, если её нет
    const saveDir = path.join(process.cwd(), 'public', 'generated-images')
    console.log('📂 Save directory:', saveDir)
    
    try {
      if (!fs.existsSync(saveDir)) {
        console.log('📁 Creating save directory...')
        fs.mkdirSync(saveDir, { recursive: true })
        console.log('✅ Save directory created')
      } else {
        console.log('✅ Save directory already exists')
      }
    } catch (dirError) {
      console.error('❌ Error creating save directory:', dirError)
      return NextResponse.json(
        { 
          error: 'Failed to create save directory',
          details: dirError instanceof Error ? dirError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Генерируем уникальное имя файла, если не предоставлено
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 9)
    const finalFilename = filename || `generated-image-${timestamp}-${randomId}.png`
    const filePath = path.join(saveDir, finalFilename)

    console.log('📥 Downloading image from:', imageUrl)
    console.log('💾 Will save as:', finalFilename)
    
    // Скачиваем изображение с улучшенной обработкой ошибок
    let response: Response
    try {
      response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RedAI-ImageDownloader/1.0)',
        }
      })
    } catch (fetchError) {
      console.error('❌ Network error during fetch:', fetchError)
      return NextResponse.json(
        { 
          error: 'Failed to download image: Network error',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown network error'
        },
        { status: 500 }
      )
    }
    
    if (!response.ok) {
      console.error('❌ HTTP error during download:', response.status, response.statusText)
      return NextResponse.json(
        { 
          error: `Failed to download image: HTTP ${response.status}`,
          details: response.statusText
        },
        { status: response.status }
      )
    }

    // Получаем данные изображения
    let imageBuffer: ArrayBuffer
    try {
      imageBuffer = await response.arrayBuffer()
      console.log('✅ Image downloaded successfully, size:', imageBuffer.byteLength, 'bytes')
    } catch (bufferError) {
      console.error('❌ Error reading image buffer:', bufferError)
      return NextResponse.json(
        { 
          error: 'Failed to read image data',
          details: bufferError instanceof Error ? bufferError.message : 'Unknown buffer error'
        },
        { status: 500 }
      )
    }

    const buffer = Buffer.from(imageBuffer)

    // Сохраняем изображение в локальную папку
    try {
      fs.writeFileSync(filePath, buffer)
      console.log('✅ Image saved to local file:', filePath)
    } catch (writeError) {
      console.error('❌ Error writing file:', writeError)
      return NextResponse.json(
        { 
          error: 'Failed to save image to local storage',
          details: writeError instanceof Error ? writeError.message : 'Unknown write error'
        },
        { status: 500 }
      )
    }

    // Проверяем, что файл действительно создан
    try {
      const stats = fs.statSync(filePath)
      console.log('✅ File verification: size =', stats.size, 'bytes')
    } catch (statError) {
      console.error('❌ Error verifying saved file:', statError)
      return NextResponse.json(
        { 
          error: 'File was not saved properly',
          details: statError instanceof Error ? statError.message : 'Unknown verification error'
        },
        { status: 500 }
      )
    }

    // Возвращаем локальный URL
    const localUrl = `/generated-images/${finalFilename}`
    
    console.log('✅ Image saved locally as fallback to:', localUrl)
    
    return NextResponse.json({
      success: true,
      originalUrl: imageUrl,
      localUrl: localUrl,
      filename: finalFilename,
      storageType: 'local',
      message: 'Image downloaded and saved locally (S3 fallback)',
      fileSize: buffer.length
    })

  } catch (error) {
    console.error('❌ Unexpected error in save-image endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Failed to download and save image',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 