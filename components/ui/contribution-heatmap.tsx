'use client'

import React, { useMemo } from 'react'

interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4 // 0 = no activity, 4 = most activity
}

interface ContributionHeatmapProps {
  data?: ContributionDay[]
  year?: number
  className?: string
  showTooltips?: boolean
}

export default function ContributionHeatmap({ 
  data = [], 
  year = new Date().getFullYear(),
  className = '',
  showTooltips = true
}: ContributionHeatmapProps) {
  
  // Use provided data or generate sample data
  const contributionData = useMemo(() => {
    // If real data is provided, use it
    if (data.length > 0) {
      return data
    }
    
    // Otherwise generate sample data for demonstration
    const sampleData: ContributionDay[] = []
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const randomActivity = Math.random()
      let level: 0 | 1 | 2 | 3 | 4 = 0
      
      if (randomActivity > 0.7) level = 4
      else if (randomActivity > 0.5) level = 3
      else if (randomActivity > 0.3) level = 2
      else if (randomActivity > 0.15) level = 1
      
      sampleData.push({
        date: currentDate.toISOString().split('T')[0],
        count: level * Math.floor(Math.random() * 5) + level,
        level
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return sampleData
  }, [data, year])

  // Group days by weeks
  const weekData = useMemo(() => {
    const weeks: ContributionDay[][] = []
    let currentWeek: ContributionDay[] = []
    
    contributionData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay()
      
      if (index === 0) {
        // Fill empty days at the beginning of the first week
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', count: 0, level: 0 })
        }
      }
      
      currentWeek.push(day)
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    
    // Add remaining days to the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0, level: 0 })
      }
      weeks.push(currentWeek)
    }
    
    return weeks
  }, [contributionData])

  const getLevelColor = (level: number): string => {
    switch (level) {
      case 0: return 'bg-slate-100 dark:bg-slate-800'
      case 1: return 'bg-green-200 dark:bg-green-900'
      case 2: return 'bg-green-300 dark:bg-green-700'
      case 3: return 'bg-green-400 dark:bg-green-600'
      case 4: return 'bg-green-500 dark:bg-green-500'
      default: return 'bg-slate-100 dark:bg-slate-800'
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getActivityText = (count: number): string => {
    if (count === 0) return 'Нет заходов'
    if (count === 1) return '1 заход'
    if (count < 5) return `${count} захода`
    return `${count} заходов`
  }

  const totalContributions = contributionData.reduce((sum, day) => sum + day.count, 0)
  const activeWeeks = weekData.filter(week => week.some(day => day.level > 0)).length
  const isRealData = data.length > 0

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isRealData ? `Заходы на dashboard за ${year} год` : `Активность за ${year} год`}
          </h3>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isRealData ? `${totalContributions} заходов` : `${totalContributions} действий`} за {activeWeeks} недель
          </div>
        </div>
        
        <div className="flex gap-1 overflow-x-auto max-w-full">
          {weekData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    w-2.5 h-2.5 rounded-sm border border-slate-200 dark:border-slate-700 
                    ${getLevelColor(day.level)}
                    transition-all duration-200 hover:scale-110 cursor-pointer
                  `}
                  title={showTooltips && day.date ? 
                    `${formatDate(day.date)} - ${getActivityText(day.count)}` : 
                    undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Меньше</span>
        <div className="flex items-center space-x-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-2.5 h-2.5 rounded-sm border border-slate-200 dark:border-slate-700 ${getLevelColor(level)}`}
            />
          ))}
        </div>
        <span>Больше</span>
      </div>
    </div>
  )
} 