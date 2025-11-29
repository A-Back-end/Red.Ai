'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Rocket, Play, Moon, Sun, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NeuralBackground from '../../components/NeuralBackground'
import LogoShowcase from '../../components/LogoShowcase'
import Features from '../../components/Features'
import HowItWorks from '../../components/HowItWorks'
import Pricing from '../../components/Pricing'
import Testimonials from '../../components/Testimonials'
import Contact from '../../components/Contact'
import CTA from '../../components/CTA'
import Footer from '../../components/Footer'
import { useTranslation } from '@/lib/useTranslation'
import { useAppStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-context'
import { initThemeSync, getSavedTheme, getSavedLanguage, setGlobalTheme, setGlobalLanguage } from '@/lib/theme-sync'

export default function AuthLandingPage() {
  const [theme, setTheme] = useState('dark')
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Используем систему переводов
  const { t, language } = useTranslation()
  
  // Синхронизируем с глобальным store
  const { setLanguage: setStoreLanguage } = useAppStore()
  
  // Получаем setLanguage из темы
  const { setLanguage } = useTheme()

  useEffect(() => {
    // Initialize global theme sync system
    initThemeSync()
    
    // Load current settings from global sync
    const savedTheme = getSavedTheme()
    const savedLanguage = getSavedLanguage()
    
    setTheme(savedTheme)
    setLanguage(savedLanguage)
    setStoreLanguage(savedLanguage)

    // Handle scroll for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setLanguage, setStoreLanguage])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    setGlobalTheme(newTheme)
  }

  const handleLanguageChange = (lang: 'en' | 'ru') => {
    setLanguage(lang)
    setStoreLanguage(lang)
    setGlobalLanguage(lang)
  }

  // Определяем класс панели в зависимости от темы
  const panelBgClass = theme === 'dark'
    ? 'bg-slate-900/90 backdrop-blur-md text-white border border-slate-800 shadow-xl'
    : 'bg-white text-black border border-white shadow-lg backdrop-blur-md';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
              <NeuralBackground />
      
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-20 border-b border-slate-200 dark:border-slate-700' 
          : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text">RED AI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="nav-link text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm px-3 py-2 rounded-lg">
                {t('nav_features')}
              </a>
              <a href="#how-it-works" className="nav-link text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm px-3 py-2 rounded-lg">
                {t('nav_how_it_works')}
              </a>
              <a href="#pricing" className="nav-link text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm px-3 py-2 rounded-lg">
                {t('nav_pricing')}
              </a>
              <a href="#contact" className="nav-link text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm px-3 py-2 rounded-lg">
                {t('nav_contact')}
              </a>
              
              {/* Language Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-800 text-white opacity-80 hover:opacity-100'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('ru')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    language === 'ru'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-800 text-white opacity-80 hover:opacity-100'
                  }`}
                >
                  RU
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-300"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-5 py-2 text-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  {t('nav_get_started')}
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 backdrop-blur-20 border border-blue-500/30 rounded-full px-6 py-2 flex items-center space-x-2">
                <Star className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 font-medium text-sm">{t('hero_badge')}</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-br from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                {t('hero_title')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/login">
                <Button className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/25">
                  <Rocket className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  {t('hero_btn_primary')}
                </Button>
              </Link>
              
              <Button variant="outline" className="group bg-white/10 backdrop-blur-20 border-white/20 text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:-translate-y-1">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t('hero_btn_secondary')}
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-20 border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-white mb-2">{t('stat_number_1')}</div>
                <div className="text-slate-300">{t('stat_label_1')}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-20 border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-white mb-2">{t('stat_number_2')}</div>
                <div className="text-slate-300">{t('stat_label_2')}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-20 border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-white mb-2">{t('stat_number_3')}</div>
                <div className="text-slate-300">{t('stat_label_3')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Showcase */}
        <LogoShowcase />

        {/* Features Section */}
        <Features />

        {/* How It Works */}
        <HowItWorks />

        {/* Pricing */}
        <Pricing />

        {/* Testimonials */}
        <Testimonials />

        {/* Contact */}
        <Contact />

        {/* CTA */}
        <CTA />

        {/* Footer */}
        <Footer />
      </main>

      {/* Auth Panel */}
      <div className={`w-full max-w-md mx-auto mt-24 rounded-2xl p-8 ${panelBgClass} transition-colors duration-300`}>
        <h2 className="text-3xl font-bold mb-6 text-center">{t('auth_title')}</h2>
        <p className="text-slate-300 mb-8 text-center">{t('auth_subtitle')}</p>
        
        <div className="flex flex-col space-y-4">
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              {t('auth_login_btn')}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:-translate-y-1">
              {t('auth_register_btn')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 