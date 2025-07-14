'use client'

import React from 'react'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreditsDisplayProps {
  credits: number
  className?: string
  variant?: 'default' | 'compact'
}

export function CreditsDisplay({ credits, className, variant = 'default' }: CreditsDisplayProps) {
  const isLow = credits <= 5
  const isEmpty = credits === 0

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all",
        isEmpty 
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
          : isLow 
          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
          : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
        className
      )}>
        <Zap className={cn(
          "h-4 w-4",
          isEmpty ? "text-red-500" : isLow ? "text-orange-500" : "text-emerald-500"
        )} />
        <span className={cn(
          "text-sm font-medium",
          isEmpty 
            ? "text-red-700 dark:text-red-300" 
            : isLow 
            ? "text-orange-700 dark:text-orange-300"
            : "text-emerald-700 dark:text-emerald-300"
        )}>
          {credits}
        </span>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all",
      isEmpty 
        ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-300 dark:border-red-700" 
        : isLow 
        ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-300 dark:border-orange-700"
        : "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-300 dark:border-emerald-700",
      className
    )}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        isEmpty 
          ? "bg-red-500/20" 
          : isLow 
          ? "bg-orange-500/20"
          : "bg-emerald-500/20"
      )}>
        <Zap className={cn(
          "h-4 w-4",
          isEmpty ? "text-red-600 dark:text-red-400" : isLow ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
        )} />
      </div>
      <div>
        <p className={cn(
          "text-xs font-medium uppercase tracking-wide",
          isEmpty 
            ? "text-red-600 dark:text-red-400" 
            : isLow 
            ? "text-orange-600 dark:text-orange-400"
            : "text-emerald-600 dark:text-emerald-400"
        )}>
          Credits
        </p>
        <p className={cn(
          "text-lg font-bold",
          isEmpty 
            ? "text-red-800 dark:text-red-200" 
            : isLow 
            ? "text-orange-800 dark:text-orange-200"
            : "text-emerald-800 dark:text-emerald-200"
        )}>
          {credits}
        </p>
      </div>
      {isEmpty && (
        <div className="text-xs text-red-600 dark:text-red-400 ml-2">
          Insufficient credits
        </div>
      )}
    </div>
  )
} 