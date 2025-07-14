'use client'

import React, { useState, useRef } from 'react'
import { Settings, Sun, Moon, User, Globe, BarChart, Camera, Check, X, Upload, Trash2, MapPin, Link, FileText, Palette, BarChart3, Zap, Activity, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useTranslation } from '@/lib/useTranslation'
import { useTheme } from '@/lib/theme-context'
import { useUserProfile } from '@/lib/user-profile'
import { useActivityTracker } from '@/lib/useActivityTracker'
import toast from 'react-hot-toast'
import { Input } from '../ui/input' // Import the Input component
import { Label } from '../ui/label' // Import the Label component
import ContributionHeatmap from '../ui/contribution-heatmap'

export default function SettingsPanel() {
  const { t, language } = useTranslation()
  const { theme, toggleTheme, toggleLanguage } = useTheme()
  const { profile, isLoaded, getInitials, getDisplayName, updateUserProfile } = useUserProfile()
  const { activityData, getActivityStats, clearActivity, trackVisit } = useActivityTracker()
  
  const [apiKey, setApiKey] = useState('')
  const [localSettings, setLocalSettings] = useState({
    notifications: true,
    autoSave: true,
    highQuality: false
  })
  const [displayName, setDisplayName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)

  // Initialize displayName when profile loads
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.fullName || '')
    }
  }, [profile])

  // Получить статистику активности
  const activityStats = getActivityStats()

  // Сохранение API ключа
  const handleSaveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey)
    toast.success(t('apiKeySaved'))
  }

  // Переключение языка с уведомлением
  const handleToggleLanguage = () => {
    toggleLanguage()
    toast.success(t('languageChanged'))
  }

  // Сохранение имени пользователя
  const handleSaveDisplayName = async () => {
    if (!profile) return
    setIsSavingName(true)
    try {
      await updateUserProfile(displayName)
      toast.success(t('displayNameSaved'))
    } catch (error) {
      toast.error(t('displayNameSaveError'))
    } finally {
      setIsSavingName(false)
    }
  }

  // Очистить данные активности (для тестирования)
  const handleClearActivity = () => {
    clearActivity()
    toast.success('Данные активности очищены')
  }

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-8">
        {t('settings')}
      </h1>
      
      {/* Profile Section */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-500" />
            <span>{t('profile')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-600">
              {profile?.imageUrl ? (
                <img 
                  src={profile.imageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('displayName')}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('yourName')}
                />
                <Button onClick={handleSaveDisplayName} size="sm" disabled={isSavingName || displayName === profile?.fullName}>
                  {isSavingName ? t('saving') : t('save')}
                </Button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {t('displayNameDescription')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme & Language */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Palette className="h-6 w-6 text-purple-500" />
            <span>{t('appearance')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" /> : <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">{t('theme')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {theme === 'dark' ? t('darkMode') : t('lightMode')}
                </p>
              </div>
            </div>
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-600"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {theme === 'dark' ? t('lightMode') : t('darkMode')}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">{t('language')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {language === 'en' ? 'English' : 'Русский'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleToggleLanguage}
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-600"
            >
              {language === 'en' ? '🇷🇺 RU' : '🇺🇸 EN'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-yellow-500" />
            <span>{t('apiSettings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              OpenAI API Key
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button onClick={handleSaveApiKey} size="sm">
                {t('save')}
              </Button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('apiKeyDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-slate-500" />
            <span>{t('appSettings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('notifications')}</span>
              <input
                type="checkbox"
                checked={localSettings.notifications}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('autoSave')}</span>
              <input
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('highQuality')}</span>
              <input
                type="checkbox"
                checked={localSettings.highQuality}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, highQuality: e.target.checked }))}
                className="rounded"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-green-500" />
              <span>Активность входов</span>
            </div>
            <Button
              onClick={handleClearActivity}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Очистить
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContributionHeatmap data={activityData} />
          
          {/* Статистика активности */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{activityStats.totalVisits}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Всего заходов</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{activityStats.activeDays}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Активных дней</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{activityStats.activeWeeks}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Активных недель</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{activityStats.averageVisitsPerDay}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">В среднем в день</div>
            </div>
          </div>
          
          {/* Тестовая панель */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Тестирование трекинга
              </h4>
              <Button
                onClick={() => { trackVisit(); toast.success('Заход записан!') }}
                size="sm"
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300"
              >
                <User className="h-4 w-4 mr-2" />
                Добавить заход
              </Button>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Кликните "Добавить заход" чтобы симулировать заходы на dashboard и увидеть изменения в heatmap
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            <span>{t('usage')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">24</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t('projectsCreated')}</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">156</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t('imagesGenerated')}</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-500">89%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t('creditsUsed')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 