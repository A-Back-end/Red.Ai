/**
 * AWS S3 Service для загрузки и управления изображениями
 * Обеспечивает постоянное хранение изображений вместо временных ссылок
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

interface UploadResult {
  success: boolean
  publicUrl?: string
  s3Key?: string
  filename?: string
  error?: string
}

interface S3Config {
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl?: string // For custom domain or CloudFront
}

export class S3Service {
  private s3Client: S3Client
  private bucketName: string
  private publicUrl: string

  constructor(config: S3Config) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
    
    this.bucketName = config.bucketName
    // Используем кастомный URL или стандартный S3 URL
    this.publicUrl = config.publicUrl || `https://${config.bucketName}.s3.${config.region}.amazonaws.com`
  }

  /**
   * Загружает файл в S3 из Buffer или URL
   */
  async uploadImage(
    imageData: Buffer | string, 
    originalFilename?: string, 
    folder: string = 'generated-images'
  ): Promise<UploadResult> {
    try {
      let buffer: Buffer
      
      // Если передан URL, скачиваем изображение
      if (typeof imageData === 'string') {
        console.log('📥 Downloading image from URL:', imageData)
        
        const response = await fetch(imageData, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RedAI-ImageUploader/1.0)',
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        buffer = imageData
      }

      // Генерируем уникальное имя файла
      const timestamp = Date.now()
      const uuid = uuidv4().substring(0, 8)
      const extension = this.getFileExtension(originalFilename) || 'png'
      const filename = `${timestamp}-${uuid}.${extension}`
      const s3Key = `${folder}/${filename}`

      // Определяем MIME type
      const contentType = this.getMimeType(extension)

      console.log('☁️ Uploading to S3:', s3Key)

      // Загружаем файл в S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read', // Делаем файл публично доступным
        Metadata: {
          'upload-timestamp': timestamp.toString(),
          'original-filename': originalFilename || 'unknown',
          'uploaded-by': 'red-ai-system'
        }
      })

      await this.s3Client.send(uploadCommand)

      // Формируем публичный URL
      const publicUrl = `${this.publicUrl}/${s3Key}`

      console.log('✅ Image uploaded successfully to S3:', publicUrl)

      return {
        success: true,
        publicUrl,
        s3Key,
        filename
      }

    } catch (error) {
      console.error('❌ Error uploading to S3:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      }
    }
  }

  /**
   * Получает подписанный URL для приватного доступа (если нужно)
   */
  async getSignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    })

    return await getSignedUrl(this.s3Client, command, { expiresIn })
  }

  /**
   * Проверяет, настроен ли сервис
   */
  isConfigured(): boolean {
    return !!(this.bucketName && this.s3Client)
  }

  /**
   * Определяет расширение файла из имени
   */
  private getFileExtension(filename?: string): string {
    if (!filename) return 'png'
    
    const parts = filename.split('.')
    return parts.length > 1 ? parts.pop()!.toLowerCase() : 'png'
  }

  /**
   * Определяет MIME type по расширению
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    }
    
    return mimeTypes[extension.toLowerCase()] || 'image/png'
  }
}

/**
 * Создает экземпляр S3Service с настройками из environment переменных
 */
export function createS3Service(): S3Service | null {
  const region = process.env.AWS_REGION
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucketName = process.env.AWS_S3_BUCKET_NAME
  const publicUrl = process.env.AWS_S3_PUBLIC_URL // Опционально

  if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
    console.warn('⚠️ AWS S3 configuration incomplete. Missing environment variables.')
    return null
  }

  return new S3Service({
    region,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl
  })
}

/**
 * Глобальный экземпляр S3Service (singleton)
 */
let s3ServiceInstance: S3Service | null = null

export function getS3Service(): S3Service | null {
  if (!s3ServiceInstance) {
    s3ServiceInstance = createS3Service()
  }
  return s3ServiceInstance
} 