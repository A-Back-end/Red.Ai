'use client'

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { FolderOpen, Plus, Search, Filter, MoreVertical, Trash2, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useTranslations } from '../../lib/translations'
import { Project } from '@/lib/types'
import { Badge } from '../ui/badge'
import Link from 'next/link'

interface ProjectManagerProps {
  userId: string
  projects: Project[]
  isLoading: boolean
  onNewProject: () => void
  onRefreshProjects: () => void
}

export default function ProjectManager({ userId, projects, isLoading, onNewProject, onRefreshProjects }: ProjectManagerProps) {
  const { t } = useTranslations()

  const handleDelete = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/projects?projectId=${projectId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          onRefreshProjects();
        } else {
          console.error('Failed to delete project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <span>My Projects</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage and organize your design projects</p>
          </div>
          <Button 
            onClick={onNewProject}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 text-slate-500 dark:text-slate-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Loading Projects...</h2>
            <p className="text-slate-600 dark:text-slate-400">Please wait while we fetch your projects.</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="h-12 w-12 text-slate-500 dark:text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No projects yet</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Get started by creating your first project. Use our AI tools to generate stunning designs and manage your renovation projects.
            </p>
            <Button onClick={onNewProject} className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Start Creating
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
                 <Link href={`/project/${project.id}`} legacyBehavior>
                  <a className="block cursor-pointer">
                    <CardHeader className="p-0">
                      <div className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white mb-2 truncate">{project.name}</CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 h-10 overflow-hidden">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.preferredStyles?.map(style => <Badge key={style} variant="outline">{style}</Badge>)}
                      </div>
                    </CardContent>
                  </a>
                </Link>
                <CardFooter className="p-4 bg-slate-50 dark:bg-slate-800/20 mt-auto">
                  <div className="flex justify-between items-center w-full">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => console.log('Re-generating project...')}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 