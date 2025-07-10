'use client'

import React from 'react'
import { Card, CardContent } from '../ui/card'
import { FolderOpen, Plus, Search, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import { useTranslations } from '../../lib/translations'

interface ProjectManagerProps {
  userId: string
  refreshProjects: number
}

export default function ProjectManager({ userId, refreshProjects }: ProjectManagerProps) {
  const { t } = useTranslations()
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FolderOpen className="h-8 w-8 text-slate-400" />
          <div>
                         <h1 className="text-2xl font-bold text-white">{t('my_projects')}</h1>
             <p className="text-slate-400">0 {t('projects')} • 0 показано</p>
           </div>
         </div>
         <Button className="bg-blue-500 hover:bg-blue-600">
           <Plus className="h-4 w-4 mr-2" />
           {t('create_project')}
         </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('search_projects')}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400"
          />
        </div>
        <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white">
          <option>{t('all_statuses')}</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <Button className="bg-slate-700 hover:bg-slate-600">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Empty State */}
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('no_projects_found')}</h2>
        <p className="text-slate-400 mb-6">{t('create_first_project')}</p>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          {t('create_project')}
        </Button>
      </div>
    </div>
  )
} 