'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  FolderOpen, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  Upload,
  Download
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'in_progress' | 'completed'
  progress: number
  createdAt: string
  updatedAt: string
  tags: string[]
  imageCount: number
  thumbnail?: string
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  useEffect(() => {
    // Загрузка проектов
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      // Имитация API запроса
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Современная гостиная',
          description: 'Минималистский дизайн с акцентом на функциональность',
          status: 'in_progress',
          progress: 65,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          tags: ['минимализм', 'гостиная', 'современный'],
          imageCount: 12,
          thumbnail: '/api/placeholder/300/200'
        },
        {
          id: '2',
          name: 'Уютная спальня',
          description: 'Теплые тона и натуральные материалы',
          status: 'completed',
          progress: 100,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          tags: ['скандинавский', 'спальня', 'уют'],
          imageCount: 8,
          thumbnail: '/api/placeholder/300/200'
        },
        {
          id: '3',
          name: 'Кухня в стиле лофт',
          description: 'Индустриальный стиль с элементами дерева',
          status: 'draft',
          progress: 25,
          createdAt: '2024-01-22',
          updatedAt: '2024-01-22',
          tags: ['лофт', 'кухня', 'индустриальный'],
          imageCount: 3,
          thumbnail: '/api/placeholder/300/200'
        }
      ]
      setProjects(mockProjects)
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'draft': return 'Черновик'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Завершен'
      default: return 'Неизвестно'
    }
  }

  const createNewProject = () => {
    // Логика создания нового проекта
    console.log('Создание нового проекта')
  }

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId))
  }

  const duplicateProject = (project: Project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (копия)`,
      status: 'draft' as const,
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setProjects([...projects, newProject])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Мои проекты</h2>
          <p className="text-gray-600">Управляйте своими дизайн-проектами</p>
        </div>
        <Button onClick={createNewProject} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Новый проект
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего проектов</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В работе</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              <Edit3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Завершено</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <Tag className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список проектов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProject === project.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedProject(project.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {project.description}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Превью изображения */}
              {project.thumbnail && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={project.thumbnail} 
                    alt={project.name}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {/* Прогресс */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Прогресс</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Метки */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Статистика */}
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  {project.imageCount} изображений
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {project.updatedAt}
                </span>
              </div>

              {/* Действия */}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteProject(project.id)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Пустое состояние */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Пока нет проектов
          </h3>
          <p className="text-gray-600 mb-4">
            Создайте свой первый проект, чтобы начать работу
          </p>
          <Button onClick={createNewProject}>
            <Plus className="h-4 w-4 mr-2" />
            Создать проект
          </Button>
        </div>
      )}
    </div>
  )
} 