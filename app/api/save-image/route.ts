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
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

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
    
    console.log('✅ Image saved locally as fallback to:', localUrl)
    
    return NextResponse.json({
      success: true,
      originalUrl: imageUrl,
      localUrl: localUrl,
      filename: finalFilename,
      storageType: 'local',
      message: 'Image downloaded and saved locally (S3 fallback)'
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