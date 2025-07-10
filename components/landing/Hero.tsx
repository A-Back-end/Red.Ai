'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { Eye, EyeOff, Upload, Camera, User, AlertCircle, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ClerkGoogleSignInButton from '@/components/auth/ClerkGoogleSignInButton'
import ReCAPTCHAComponent, { ReCAPTCHARef } from '@/components/auth/ReCAPTCHA'

interface HeroProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: 'en' | 'ru'
  translations: any
}

export const Hero = ({ theme, toggleTheme, language, translations }: HeroProps) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { signIn, setActive } = useSignIn()
  const { signUp, setActive: setActiveSignUp } = useSignUp()

  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHARef>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })

  const validatePassword = (password: string): string => {
    if (password.length < 8) return translations.passwordLengthError
    return ''
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password' && !isLogin) {
      setPasswordError(validatePassword(value))
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const photoUrl = URL.createObjectURL(file)
      setProfilePhoto(photoUrl)
    } catch (error) {
      alert(translations.photoError)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !signUp) return

    if (!isLogin) {
      const passwordValidationError = validatePassword(formData.password)
      if (passwordValidationError) {
        setPasswordError(passwordValidationError)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        alert(translations.passwordsMismatch)
        return
      }
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert(translations.fillAllFields)
        return
      }
      if (!recaptchaToken) {
        alert(translations.completeRecaptcha)
        return
      }
    }

    setIsLoading(true)
    try {
      if (isLogin) {
        const result = await signIn.create({
          identifier: formData.email,
          password: formData.password,
        })
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          router.push('/dashboard')
        }
      } else {
        const result = await signUp.create({
          emailAddress: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        })
        if (result.status === 'complete') {
          await setActiveSignUp({ session: result.createdSessionId })
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      let errorMessage = translations.authError
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0]
        if (clerkError.code === 'form_identifier_not_found') {
          errorMessage = translations.accountNotFound
        } else if (clerkError.code === 'form_password_incorrect') {
          errorMessage = translations.incorrectPassword
        }
      }
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
      <div className="absolute top-6 right-6 flex items-center space-x-2">
        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-800" />}
        </button>
      </div>

      <Card className="w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-lg border-2 border-white/20 dark:border-black/30 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            {isLogin ? translations.loginTitle : translations.registerTitle}
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            {isLogin ? translations.loginSubtitle : translations.registerSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-400 dark:border-gray-500">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      placeholder={translations.firstNamePlaceholder}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-transparent focus:border-blue-500 focus:outline-none"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      placeholder={translations.lastNamePlaceholder}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-transparent focus:border-blue-500 focus:outline-none"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder={translations.emailPlaceholder}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-transparent focus:border-blue-500 focus:outline-none"
              />
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="relative">
                <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={translations.passwordPlaceholder}
                    onChange={handleInputChange}
                    className={`w-full p-3 pl-10 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white border-2 ${passwordError ? 'border-red-500' : 'border-transparent'} focus:border-blue-500 focus:outline-none`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
            </div>
             {passwordError && <p className="text-xs text-red-500 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{passwordError}</p>}


            {!isLogin && (
              <div className="relative">
                <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={translations.confirmPasswordPlaceholder}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-10 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-transparent focus:border-blue-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="pt-4">
                <ReCAPTCHAComponent
                  ref={recaptchaRef}
                  onVerify={setRecaptchaToken}
                  onExpired={() => setRecaptchaToken(null)}
                  onError={() => alert(translations.recaptchaError)}
                  theme={theme}
                />
              </div>
            )}

            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? translations.loading : (isLogin ? translations.loginButton : translations.registerButton)}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? translations.noAccount : translations.hasAccount}
              <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-500 hover:underline ml-1">
                {isLogin ? translations.registerNow : translations.loginNow}
              </button>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/10 dark:bg-black/20 px-2 text-gray-500 dark:text-gray-400 backdrop-blur-sm">{translations.orContinueWith}</span>
            </div>
          </div>

          <ClerkGoogleSignInButton 
            theme={theme}
            language={language}
            onError={(error) => alert(error)}
          />
        </CardContent>
      </Card>
    </div>
  )
} 