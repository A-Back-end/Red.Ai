import * as fs from 'fs'
import * as path from 'path'

// Интерфейс для результата сохранения изображения
interface SaveImageResult {
  success: boolean
  localUrl?: string
  filename?: string
  error?: string
  storageType?: 's3' | 'local'
  s3Key?: string
}



// Интерфейс для проекта
interface Project {
  id: string
  userId: string
  name: string
  description: string
  imageUrl: string
  originalImageUrl?: string  // Исходное изображение до обработки
  createdAt: Date | string
  updatedAt: Date | string
  status: string
  generatedImages: string[]
  budget: {
    min: number
    max: number
    currency: string
  }
  preferredStyles: string[]
  restrictions: string[]
  roomAnalysis?: any
  designRecommendation?: any
  threeDModel?: any
  pdfReport?: any
  shoppingList?: any
}

// Функция для скачивания и сохранения изображения в облачное хранилище (S3) или локально как fallback
export async function downloadAndSaveImage(imageUrl: string, customFilename?: string): Promise<SaveImageResult> {
  try {
    console.log('🔄 Starting image download process for:', imageUrl)
    
    // Проверяем, не является ли URL уже постоянным (локальным или S3)
    if (imageUrl.startsWith('/generated-images/') || 
        imageUrl.startsWith('/uploads/') ||
        imageUrl.includes('amazonaws.com') ||
        imageUrl.includes('s3.') ||
        imageUrl.startsWith('https://') && !isTemporaryUrl(imageUrl)) {
      console.log('ℹ️  Image is already permanent, skipping download')
      return {
        success: true,
        localUrl: imageUrl,
        filename: path.basename(imageUrl)
      }
    }

    // Используем API endpoint для сохранения изображения (S3 или локально)
    console.log('📥 Using /api/save-image endpoint for storage...')
    
    const response = await fetch('/api/save-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        filename: customFilename
      })
    })

    if (!response.ok) {
      throw new Error(`Save API failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save image')
    }

        return {
      success: true,
      localUrl: result.localUrl,
      filename: result.filename,
      storageType: result.storageType,
      s3Key: result.s3Key
    }

  } catch (error) {
    console.error('❌ Error downloading image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Функция для чтения проектов из базы данных
async function readProjects(): Promise<Project[]> {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'projects.json')
    const data = await fs.promises.readFile(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading projects:', error)
    return []
  }
}

// Функция для записи проектов в базу данных
async function writeProjects(projects: Project[]): Promise<void> {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'projects.json')
    await fs.promises.writeFile(dbPath, JSON.stringify(projects, null, 2))
  } catch (error) {
    console.error('Error writing projects:', error)
    throw error
  }
}

// Функция для обновления проекта с новым локальным URL изображения
export async function updateProjectWithLocalImage(projectId: string, originalUrl: string): Promise<boolean> {
  try {
    console.log('🔄 Updating project with local image:', projectId)
    
    // Скачиваем и сохраняем изображение
    const saveResult = await downloadAndSaveImage(originalUrl)
    
    if (!saveResult.success) {
      console.error('❌ Failed to save image:', saveResult.error)
      return false
    }

    // Читаем проекты
    const projects = await readProjects()
    
    // Находим проект
    const projectIndex = projects.findIndex(p => p.id === projectId)
    if (projectIndex === -1) {
      console.error('❌ Project not found:', projectId)
      return false
    }

    // Обновляем проект
    const project = projects[projectIndex]
    const oldImageUrl = project.imageUrl
    project.imageUrl = saveResult.localUrl!
    project.updatedAt = new Date().toISOString()

    // Обновляем массив generatedImages
    if (project.generatedImages) {
      const imageIndex = project.generatedImages.findIndex(img => img === oldImageUrl)
      if (imageIndex !== -1) {
        project.generatedImages[imageIndex] = saveResult.localUrl!
      } else {
        project.generatedImages.push(saveResult.localUrl!)
      }
    } else {
      project.generatedImages = [saveResult.localUrl!]
    }

    // Сохраняем обновленные проекты
    await writeProjects(projects)
    
    console.log('✅ Project updated successfully:', projectId)
    console.log('📂 Old URL:', oldImageUrl)
    console.log('📂 New URL:', saveResult.localUrl)
    
    return true

  } catch (error) {
    console.error('❌ Error updating project:', error)
    return false
  }
}

// Функция для массового обновления всех проектов с временными URL
export async function updateAllProjectsWithLocalImages(): Promise<{ updated: number, failed: number }> {
  try {
    console.log('🔄 Starting mass update of all projects...')
    
    const projects = await readProjects()
    let updated = 0
    let failed = 0

    for (const project of projects) {
      // Проверяем, если изображение имеет временный URL
      if (project.imageUrl && !project.imageUrl.startsWith('/generated-images/') && !project.imageUrl.startsWith('/uploads/')) {
        console.log(`🔄 Processing project: ${project.id}`)
        
        const success = await updateProjectWithLocalImage(project.id, project.imageUrl)
        if (success) {
          updated++
        } else {
          failed++
        }
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`✅ Mass update completed: ${updated} updated, ${failed} failed`)
    return { updated, failed }

  } catch (error) {
    console.error('❌ Error in mass update:', error)
    return { updated: 0, failed: 0 }
  }
}

// Функция для проверки, является ли URL временным
export function isTemporaryUrl(url: string): boolean {
  const temporaryDomains = [
    'delivery-eu1.bfl.ai',
    'oaidalleapiprodscus.blob.core.windows.net',
    'cdn.openai.com',
    'dalle-images.com'
  ]
  
  return temporaryDomains.some(domain => url.includes(domain)) || 
         url.includes('?se=') || // Azure blob storage with expiration
         url.includes('?expires=') // Generic expiration parameter
}

// Функция для автоматического сохранения изображения при создании проекта
export async function ensureImageIsSaved(imageUrl: string): Promise<string> {
  if (isTemporaryUrl(imageUrl)) {
    console.log('⚠️  Detected temporary URL, saving locally...')
    const result = await downloadAndSaveImage(imageUrl)
    
    if (result.success && result.localUrl) {
      return result.localUrl
    } else {
      console.error('❌ Failed to save image, keeping original URL')
      return imageUrl
    }
  }
  
  return imageUrl
} 