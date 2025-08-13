'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Wand2, 
  Download, 
  Heart, 
  Copy, 
  Trash2, 
  Settings,
  Loader2,
  RefreshCw,
  Eye,
  Save
} from 'lucide-react'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  createdAt: string
  isLiked: boolean
  isPublic: boolean
}

interface GenerationSettings {
  style: string
  quality: 'draft' | 'standard' | 'hd'
  size: '1024x1024' | '1792x1024' | '1024x1792'
  model: 'dalle-3' | 'flux' | 'stable-diffusion'
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [settings, setSettings] = useState<GenerationSettings>({
    style: 'photorealistic',
    quality: 'standard',
    size: '1024x1024',
    model: 'dalle-3'
  })
  const [progress, setProgress] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const styles = [
    { value: 'photorealistic', label: 'Фотореалистичный', description: 'Максимально реалистичные изображения' },
    { value: 'artistic', label: 'Художественный', description: 'Креативный и выразительный стиль' },
    { value: 'minimalist', label: 'Минималистичный', description: 'Чистые линии и простота' },
    { value: 'luxury', label: 'Роскошный', description: 'Элегантность и премиальность' },
    { value: 'scandinavian', label: 'Скандинавский', description: 'Уют и функциональность' },
    { value: 'modern', label: 'Современный', description: 'Актуальные тренды дизайна' }
  ]

  const generateImage = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setProgress(0)

    try {
      // Имитация прогресса
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      // Имитация API запроса
      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style: settings.style,
          quality: settings.quality,
          size: settings.size,
          model: settings.model
        })
      })

      if (!response.ok) {
        throw new Error('Ошибка генерации изображения')
      }

      const result = await response.json()
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: result.imageUrl || '/api/placeholder/1024/1024',
        prompt,
        style: settings.style,
        createdAt: new Date().toISOString(),
        isLiked: false,
        isPublic: false
      }

      setGeneratedImages([newImage, ...generatedImages])
      setProgress(100)
      
      setTimeout(() => {
        setProgress(0)
        setIsGenerating(false)
      }, 500)

    } catch (error) {
      console.error('Ошибка генерации:', error)
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const regenerateImage = async (imageId: string) => {
    const image = generatedImages.find(img => img.id === imageId)
    if (!image) return

    setPrompt(image.prompt)
    await generateImage()
  }

  const toggleLike = (imageId: string) => {
    setGeneratedImages(images =>
      images.map(img =>
        img.id === imageId ? { ...img, isLiked: !img.isLiked } : img
      )
    )
  }

  const deleteImage = (imageId: string) => {
    setGeneratedImages(images => images.filter(img => img.id !== imageId))
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Ошибка скачивания:', error)
    }
  }

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
  }

  const saveImage = (imageId: string) => {
    // Логика сохранения в проект
    console.log('Сохранение изображения:', imageId)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Генератор дизайна</h2>
        <p className="text-gray-600">Создавайте уникальные дизайны с помощью AI</p>
      </div>

      {/* Форма генерации */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Создать дизайн
          </CardTitle>
          <CardDescription>
            Опишите желаемый дизайн интерьера подробно
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Поле промпта */}
          <div>
            <Label htmlFor="prompt">Описание дизайна</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Например: Современная гостиная в минималистичном стиле с большими окнами, серым диваном, деревянным кофейным столиком и растениями..."
              className="min-h-[100px] mt-2"
            />
          </div>

          {/* Выбор стиля */}
          <div>
            <Label>Стиль дизайна</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {styles.map((style) => (
                <Card 
                  key={style.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    settings.style === style.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSettings({ ...settings, style: style.value })}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium">{style.label}</div>
                    <div className="text-xs text-gray-600">{style.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Настройки */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Качество</Label>
              <select 
                value={settings.quality}
                onChange={(e) => setSettings({ ...settings, quality: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="draft">Черновик</option>
                <option value="standard">Стандарт</option>
                <option value="hd">HD</option>
              </select>
            </div>
            <div>
              <Label>Размер</Label>
              <select 
                value={settings.size}
                onChange={(e) => setSettings({ ...settings, size: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1024x1024">Квадрат (1024x1024)</option>
                <option value="1792x1024">Широкий (1792x1024)</option>
                <option value="1024x1792">Высокий (1024x1792)</option>
              </select>
            </div>
            <div>
              <Label>Модель</Label>
              <select 
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="dalle-3">Azure DALL-E 3</option>
                <option value="flux">Flux</option>
                
              </select>
            </div>
          </div>

          {/* Прогресс генерации */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Генерация изображения...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Кнопка генерации */}
          <Button 
            onClick={generateImage} 
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Генерирую...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Создать дизайн
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Сгенерированные изображения */}
      {generatedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Сгенерированные дизайны</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative group">
                  <img 
                    src={image.url} 
                    alt={image.prompt}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedImage(image.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadImage(image.url, `design-${image.id}.png`)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {image.style}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {image.prompt}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleLike(image.id)}
                        className={image.isLiked ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-3 w-3 ${image.isLiked ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPrompt(image.prompt)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => regenerateImage(image.id)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveImage(image.id)}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteImage(image.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Пустое состояние */}
      {generatedImages.length === 0 && (
        <div className="text-center py-12">
          <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Готовы создать свой первый дизайн?
          </h3>
          <p className="text-gray-600 mb-4">
            Опишите желаемый интерьер, и AI создаст уникальный дизайн для вас
          </p>
        </div>
      )}
    </div>
  )
} 