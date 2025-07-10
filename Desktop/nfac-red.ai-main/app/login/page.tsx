'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser, useSignIn, useSignUp } from '@clerk/nextjs'
import { ArrowLeft, Sun, Moon, Eye, EyeOff, Upload, Camera, User, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NeuralBackground } from '@/components/NeuralBackground'
import { useTranslations } from '@/lib/translations'
import { useAppStore } from '@/lib/store'
import { initThemeSync, getSavedTheme, getSavedLanguage } from '@/lib/theme-sync'
import ClerkGoogleSignInButton from '@/components/auth/ClerkGoogleSignInButton'
import ReCAPTCHAComponent, { ReCAPTCHARef } from '@/components/auth/ReCAPTCHA'

export default function AuthPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, isLoaded } = useUser()
  const { signIn, setActive } = useSignIn()
  const { signUp, setActive: setActiveSignUp } = useSignUp()
  
  const [theme, setTheme] = useState('dark')
  const { language, setLanguage } = useTranslations()
  const { setLanguage: setStoreLanguage } = useAppStore()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Form validation states
  const [passwordError, setPasswordError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHARef>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })

  useEffect(() => {
    // Check if user is already authenticated with Clerk
    if (isLoaded && user) {
      router.push('/dashboard')
      return
    }

    // Initialize global theme sync system
    initThemeSync()
    
    // Load current settings from global sync
    const savedTheme = getSavedTheme()
    const savedLanguage = getSavedLanguage()
    
    setTheme(savedTheme)
    setLanguage(savedLanguage)
    setStoreLanguage(savedLanguage)
  }, [isLoaded, user, router])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    // Global sync will handle DOM updates and localStorage
  }

  const handleLanguageChange = (lang: 'en' | 'ru') => {
    setLanguage(lang)
    setStoreLanguage(lang)
    // Global sync will handle DOM updates and localStorage
  }

  // Password validation
  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return language === 'en' 
        ? 'Password must be at least 8 characters long'
        : 'Пароль должен содержать не менее 8 символов'
    }
    return ''
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    if (!isLogin) {
      const error = validatePassword(password)
      setPasswordError(error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      // For now, just create a local URL - in production you'd upload to your storage
      const photoUrl = URL.createObjectURL(file)
      setProfilePhoto(photoUrl)
      console.log('Photo selected successfully')
    } catch (error) {
      console.error('Photo selection error:', error)
      alert(language === 'en' 
        ? 'Error selecting photo. Please try again.' 
        : 'Ошибка выбора фото. Попробуйте еще раз.'
      )
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signIn || !signUp) return
    
    // Validation for registration
    if (!isLogin) {
      // Check password validation
      const passwordValidationError = validatePassword(formData.password)
      if (passwordValidationError) {
        setPasswordError(passwordValidationError)
        return
      }

      // Check passwords match
      if (formData.password !== formData.confirmPassword) {
        alert(language === 'en' ? 'Passwords do not match' : 'Пароли не совпадают')
        return
      }

      // Check all fields are filled
      if (!formData.firstName || !formData.lastName) {
        alert(language === 'en' ? 'Please fill in all fields' : 'Пожалуйста, заполните все поля')
        return
      }

      // Check reCAPTCHA for registration
      if (!recaptchaToken) {
        alert(language === 'en' 
          ? 'Please complete the reCAPTCHA verification' 
          : 'Пожалуйста, пройдите проверку reCAPTCHA'
        )
        return
      }
    }

    setIsLoading(true)
    
    try {
      if (isLogin) {
        // Login with Clerk
        const result = await signIn.create({
          identifier: formData.email,
          password: formData.password,
        })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          router.push('/dashboard')
        }
      } else {
        // Register with Clerk
        const result = await signUp.create({
          emailAddress: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        })

        if (result.status === 'complete') {
          await setActiveSignUp({ session: result.createdSessionId })
      router.push('/dashboard')
        } else {
          // Handle email verification if needed
          console.log('Sign up requires verification:', result)
        }
      }
      
    } catch (error: any) {
      console.error('Clerk auth error:', error)
      
      let errorMessage = language === 'en' 
        ? 'Authentication failed. Please try again.' 
        : 'Ошибка авторизации. Попробуйте еще раз.'

      // Handle specific Clerk errors
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0]
        if (clerkError.code === 'form_identifier_not_found') {
          errorMessage = language === 'en' 
            ? 'Account not found. Please check your email or sign up.' 
            : 'Аккаунт не найден. Проверьте email или зарегистрируйтесь.'
        } else if (clerkError.code === 'form_password_incorrect') {
          errorMessage = language === 'en' 
            ? 'Incorrect password. Please try again.' 
            : 'Неверный пароль. Попробуйте еще раз.'
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Google Sign-In handlers
  const handleGoogleSuccess = (userData: any) => {
    console.log('Clerk Google Sign-In successful:', userData)
    // The redirect to dashboard is handled by Clerk automatically
  }

  const handleGoogleError = (error: string) => {
    alert(error)
  }

  // reCAPTCHA handlers
  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null)
  }

  const handleRecaptchaError = () => {
    setRecaptchaToken(null)
    alert(language === 'en' 
      ? 'reCAPTCHA error. Please try again.' 
      : 'Ошибка reCAPTCHA. Попробуйте еще раз.'
    )
  }

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'
    }`}>
        <NeuralBackground theme={theme as 'light' | 'dark'} />
      
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-300 ${
            language === 'en'
              ? theme === 'dark' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-blue-500 text-white shadow-lg'
              : theme === 'dark'
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                : 'bg-white/50 text-slate-600 hover:bg-white/70'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => handleLanguageChange('ru')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-300 ${
            language === 'ru'
              ? theme === 'dark' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-blue-500 text-white shadow-lg'
              : theme === 'dark'
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                : 'bg-white/50 text-slate-600 hover:bg-white/70'
          }`}
        >
          РУ
        </button>
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl backdrop-blur-20 transition-all duration-300 hover:scale-110 ${
            theme === 'dark' 
              ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50' 
              : 'bg-white/50 text-slate-600 hover:bg-white/70'
          }`}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Back to Home */}
      <div className="fixed top-4 left-16 z-50">
        <Link href="/">
          <button className={`p-3 rounded-xl backdrop-blur-20 transition-all duration-300 hover:scale-110 ${
            theme === 'dark' 
              ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50' 
              : 'bg-white/50 text-slate-600 hover:bg-white/70'
          }`}>
            <ArrowLeft className="h-5 w-5" />
          </button>
      </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className={`backdrop-blur-20 border-0 shadow-2xl transition-all duration-500 ${
            theme === 'dark' 
              ? 'bg-slate-800/40 dark:bg-slate-800/40' 
              : 'bg-white/60'
          }`}>
            {/* Auth Toggle Tabs */}
            <div className="flex border-b border-slate-200/20">
                <button
                  onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                    isLogin
                    ? theme === 'dark'
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                      : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                {language === 'en' ? 'Sign In' : 'Вход'}
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                    !isLogin
                    ? theme === 'dark'
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                      : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                {language === 'en' ? 'Sign Up' : 'Регистрация'}
                </button>
              </div>

            <CardHeader className="text-center space-y-2">
              <CardTitle className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-900' : 'text-slate-100 dark:text-slate-100'
              }`}>
                {isLogin 
                  ? (language === 'en' ? 'Welcome Back!' : 'Добро пожаловать!')
                  : (language === 'en' ? 'Create Account' : 'Создать аккаунт')
                }
              </CardTitle>
              <CardDescription className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {isLogin 
                  ? (language === 'en' 
                      ? 'Sign in to continue to your dashboard' 
                      : 'Войдите, чтобы продолжить в панель управления'
                    )
                  : (language === 'en' 
                      ? 'Create your account to get started' 
                      : 'Создайте аккаунт, чтобы начать'
                    )
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Photo Upload (only for registration) */}
                {!isLogin && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 shadow-lg transition-all duration-300 ${
                        theme === 'light' 
                          ? 'bg-slate-50 border-slate-200' 
                          : 'bg-slate-200 dark:bg-slate-700 border-white dark:border-slate-600'
                      }`}>
                        {profilePhoto ? (
                          <img 
                            src={profilePhoto} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {uploadingPhoto ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />

                    <p className={`text-xs text-center transition-colors duration-300 ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {language === 'en' ? 'Optional profile photo' : 'Фото профиля (необязательно)'}
                    </p>
                  </div>
                )}

                {/* First Name and Last Name (only for registration) */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                        theme === 'light' ? 'text-slate-900' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {language === 'en' ? 'First Name' : 'Имя'}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            firstName: e.target.value
                          })
                        }}
                        placeholder={language === 'en' ? 'First name' : 'Имя'}
                        className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 ${
                          theme === 'light' 
                            ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 hover:border-slate-300 focus:bg-white'
                            : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-20 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400'
                        }`}
                        autoComplete="given-name"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                        theme === 'light' ? 'text-slate-900' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {language === 'en' ? 'Last Name' : 'Фамилия'}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            lastName: e.target.value
                          })
                        }}
                        placeholder={language === 'en' ? 'Last name' : 'Фамилия'}
                        className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 ${
                          theme === 'light' 
                            ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 hover:border-slate-300 focus:bg-white'
                            : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-20 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400'
                        }`}
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-900' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {language === 'en' ? 'Email' : 'Электронная почта'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        email: e.target.value
                      })
                    }}
                    placeholder={language === 'en' ? 'Enter your email' : 'Введите email'}
                    className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 ${
                      theme === 'light' 
                        ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 hover:border-slate-300 focus:bg-white'
                        : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-20 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400'
                    }`}
                    autoComplete="email"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-900' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {language === 'en' ? 'Password' : 'Пароль'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={(e) => {
                        handlePasswordChange(e.target.value)
                      }}
                      placeholder={language === 'en' ? 'Enter password' : 'Введите пароль'}
                      className={`w-full rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 ${
                        theme === 'light' 
                          ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 hover:border-slate-300 focus:bg-white'
                          : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-20 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400'
                      }`}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      autoCorrect="off"
                      spellCheck="false"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                        theme === 'light' 
                          ? 'text-slate-500 hover:text-slate-700' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {/* Password validation error */}
                  {!isLogin && passwordError && (
                    <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password (only for registration) */}
                {!isLogin && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      theme === 'light' ? 'text-slate-900' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {language === 'en' ? 'Confirm Password' : 'Подтвердите пароль'}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value
                          })
                        }}
                        placeholder={language === 'en' ? 'Confirm password' : 'Подтвердите пароль'}
                        className={`w-full rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 ${
                          theme === 'light' 
                            ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 hover:border-slate-300 focus:bg-white'
                            : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-20 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400'
                        }`}
                        autoComplete="new-password"
                        autoCorrect="off"
                        spellCheck="false"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                          theme === 'light' 
                            ? 'text-slate-500 hover:text-slate-700' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* reCAPTCHA (only for registration) */}
                {!isLogin && (
                  <div className="flex justify-center">
                    <ReCAPTCHAComponent
                      ref={recaptchaRef}
                      theme={theme as 'light' | 'dark'}
                      onVerify={handleRecaptchaChange}
                      onExpired={handleRecaptchaExpired}
                      onError={handleRecaptchaError}
                      size="normal"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || uploadingPhoto}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 text-base rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>
                        {language === 'en' 
                          ? (isLogin ? 'Signing in...' : 'Creating account...') 
                          : (isLogin ? 'Вход...' : 'Создание аккаунта...')
                        }
                      </span>
                    </div>
                  ) : (
                    isLogin 
                      ? (language === 'en' ? 'Sign In' : 'Войти')
                      : (language === 'en' ? 'Create Account' : 'Создать аккаунт')
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className={`absolute inset-0 flex items-center ${
                  theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span className="w-full border-t border-slate-300/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`px-2 ${
                    theme === 'light' 
                      ? 'bg-white text-slate-500' 
                      : 'bg-slate-800/90 text-slate-400'
                  }`}>
                    {language === 'en' ? 'Or continue with' : 'Или войти через'}
                  </span>
                </div>
              </div>

              {/* Clerk Google Sign-In Button */}
              <ClerkGoogleSignInButton
                theme={theme as 'light' | 'dark'}
                language={language}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                className="mb-6"
              />

              {/* Terms */}
              <p className={`text-xs text-center mt-6 transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {language === 'en' 
                  ? 'By continuing, you agree to our Terms of Service and Privacy Policy' 
                  : 'Продолжая, вы соглашаетесь с Условиями использования и Политикой конфиденциальности'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 