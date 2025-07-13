'use client'

import React, { useState, useRef } from 'react'
import { Settings, Sun, Moon, User, Globe, BarChart, Camera, Check, X, Upload, Trash2, MapPin, Link, FileText, Palette, BarChart3, Zap } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useTranslation } from '@/lib/useTranslation'
import { useTheme } from '@/lib/theme-context'
import { useUserProfile } from '@/lib/user-profile'
import toast from 'react-hot-toast'
import { Input } from '../ui/input' // Import the Input component
import { Label } from '../ui/label' // Import the Label component

export default function SettingsPanel() {
  const { t, language } = useTranslation()
  const { theme, toggleTheme, toggleLanguage } = useTheme()
  const { profile, isLoaded, getInitials, getDisplayName, updateUserProfile } = useUserProfile() // Destructure updateUserProfile
  
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
      await updateUserProfile(displayName) // Use the new updateUserProfile function
      toast.success(t('displayNameSaved'))
    } catch (error) {
      toast.error(t('displayNameSaveError'))
    } finally {
      setIsSavingName(false)
    }
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
              <Label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
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
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium">{t('theme')}</p>
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
              <Globe className="h-5 w-5" />
              <div>
                <p className="font-medium">{t('language')}</p>
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
            <label className="block text-sm font-medium mb-2">
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
              <span className="text-sm font-medium">{t('notifications')}</span>
              <input
                type="checkbox"
                checked={localSettings.notifications}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('autoSave')}</span>
              <input
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('highQuality')}</span>
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

      {/* Usage Stats */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-green-500" />
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