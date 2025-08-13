/**
 * Domovenok AI Assistant Demo Page
 * Демонстрационная страница для AI-ассистента Домовёнок
 */

import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { 
  Settings, 
  Home, 
  ArrowLeft, 
  Download, 
  Upload, 
  RotateCcw,
  Info,
  HelpCircle 
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import DomovenokAIAssistant from '../../components/dashboard/DomovenokAIAssistant'
import DomovenokConfigManager, { 
  DEFAULT_CONFIG, 
  ROLE_CONFIGS, 
  COMMUNICATION_STYLES 
} from '../../components/aiAssistant/DomovenokConfig'

const AIAssistantDemo: NextPage = () => {
  const router = useRouter()
  const [configManager] = useState(new DomovenokConfigManager())
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [showConfig, setShowConfig] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    // Загрузить конфигурацию из localStorage
    configManager.loadFromStorage()
    setConfig(configManager.getConfig())
  }, [configManager])

  const handleConfigUpdate = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    configManager.updateConfig(updates)
    configManager.saveToStorage()
  }

  const handleResetConfig = () => {
    configManager.resetToDefault()
    setConfig(configManager.getConfig())
  }

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'domovenok-config.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string)
          configManager.updateConfig(importedConfig)
          setConfig(configManager.getConfig())
          configManager.saveToStorage()
        } catch (error) {
          console.error('Failed to import config:', error)
          alert('Ошибка при импорте конфигурации')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <>
      <Head>
        <title>Домовёнок AI-ассистент - Демо</title>
        <meta name="description" content="Демонстрация AI-ассистента Домовёнок для недвижимости и дизайна" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к дэшборду
                </Button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Домовёнок AI-ассистент
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Демонстрационная страница
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setShowInfo(!showInfo)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400"
                >
                  <Info className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={() => setShowConfig(!showConfig)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Info Panel */}
        {showInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-start space-x-3">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Как использовать Домовёнка
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    Выберите роль ассистента и стиль общения в настройках. Задавайте вопросы о недвижимости, 
                    дизайне интерьера, ремонте или инвестициях. Используйте быстрые вопросы для начала разговора.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Panel */}
        {showConfig && (
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Роль ассистента</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(ROLE_CONFIGS).map(([key, role]) => (
                        <button
                          key={key}
                          onClick={() => handleConfigUpdate({ defaultRole: key })}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            config.defaultRole === key
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{role.emoji}</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {role.name}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {role.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Style Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Стиль общения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(COMMUNICATION_STYLES).map(([key, style]) => (
                        <button
                          key={key}
                          onClick={() => handleConfigUpdate({ defaultStyle: key })}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            config.defaultStyle === key
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{style.emoji}</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {style.name}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {style.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Settings and Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Настройки</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current Configuration */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Текущая роль:
                          </span>
                          <Badge variant="secondary">
                            {ROLE_CONFIGS[config.defaultRole as keyof typeof ROLE_CONFIGS]?.name}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Стиль общения:
                          </span>
                          <Badge variant="secondary">
                            {COMMUNICATION_STYLES[config.defaultStyle as keyof typeof COMMUNICATION_STYLES]?.name}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Макс. длина сообщения:
                          </span>
                          <Badge variant="secondary">
                            {config.maxMessageLength}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          onClick={handleResetConfig}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Сбросить настройки
                        </Button>
                        
                        <Button
                          onClick={handleExportConfig}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Экспорт конфигурации
                        </Button>
                        
                        <div className="relative">
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportConfig}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Импорт конфигурации
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <DomovenokAIAssistant 
            userId="demo-user"
            onClose={() => router.push('/dashboard')}
          />
        </main>
      </div>
    </>
  )
}

export default AIAssistantDemo 