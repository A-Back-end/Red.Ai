'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

interface ProjectInfo {
  id: string
  name: string
  imageUrl: string
  isTemporary: boolean
}

interface UpdateResult {
  updated: number
  failed: number
}

export default function ImageManager() {
  const [projects, setProjects] = useState<ProjectInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null)
  const [totalProjects, setTotalProjects] = useState(0)
  const [temporaryProjects, setTemporaryProjects] = useState(0)

  // Функция для загрузки информации о проектах
  const loadProjectsInfo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/update-project-images')
      const data = await response.json()
      
      if (data.success) {
        setProjects(data.projectsToUpdate)
        setTotalProjects(data.totalProjects)
        setTemporaryProjects(data.temporaryProjects)
      }
    } catch (error) {
      console.error('Error loading projects info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для массового обновления всех проектов
  const updateAllProjects = async () => {
    try {
      setIsUpdating(true)
      const response = await fetch('/api/update-project-images?action=update-all')
      const data = await response.json()
      
      if (data.success) {
        setUpdateResult(data.results)
        // Перезагружаем информацию о проектах
        await loadProjectsInfo()
      }
    } catch (error) {
      console.error('Error updating projects:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Функция для обновления конкретного проекта
  const updateSingleProject = async (projectId: string, imageUrl: string) => {
    try {
      const response = await fetch('/api/update-project-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, imageUrl })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Обновляем локальный список проектов
        setProjects(prev => prev.filter(p => p.id !== projectId))
        setTemporaryProjects(prev => prev - 1)
      }
    } catch (error) {
      console.error('Error updating single project:', error)
    }
  }

  // Загружаем информацию при монтировании компонента
  useEffect(() => {
    loadProjectsInfo()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Image Manager</h1>
        <Button 
          onClick={loadProjectsInfo}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              All projects in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Temporary URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{temporaryProjects}</div>
            <p className="text-xs text-muted-foreground">
              Projects with temporary images
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Local Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalProjects - temporaryProjects}</div>
            <p className="text-xs text-muted-foreground">
              Projects with saved images
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Результат обновления */}
      {updateResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Update Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Successfully updated:</span>
                <Badge variant="default" className="bg-green-600">
                  {updateResult.updated}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Failed to update:</span>
                <Badge variant="destructive">
                  {updateResult.failed}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Массовое обновление */}
      {temporaryProjects > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Temporary Images Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-4">
              Found {temporaryProjects} projects with temporary image URLs that may expire.
              Click below to download and save all images permanently.
            </p>
            <Button 
              onClick={updateAllProjects}
              disabled={isUpdating}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating All Projects...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Save All Images Permanently
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Список проектов с временными URL */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects with Temporary URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {project.imageUrl}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Temporary
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => updateSingleProject(project.id, project.imageUrl)}
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сообщение, если нет проектов с временными URL */}
      {projects.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All Images Are Saved</h3>
            <p className="text-muted-foreground">
              All project images are stored permanently. No temporary URLs found.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 