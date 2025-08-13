'use client'

import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Heart, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { useTranslations } from '@/lib/translations'

export default function SavedDesigns() {
  const { t } = useTranslations()
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">{t('savedDesigns')} (0)</h1>
            <p className="text-slate-400">Your collection</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No saved designs yet</h2>
        <p className="text-slate-400 mb-6">Generate your first design to see it here</p>
        <Button className="bg-red-500 hover:bg-red-600">
          <Plus className="h-4 w-4 mr-2" />
          Generate First Design
        </Button>
      </div>
    </div>
  )
} 