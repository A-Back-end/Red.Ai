/**
 * Google reCAPTCHA Component
 * Компонент Google reCAPTCHA
 */

'use client'

import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface ReCAPTCHAComponentProps {
  theme: 'light' | 'dark'
  onVerify: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
  size?: 'compact' | 'normal'
  className?: string
}

export interface ReCAPTCHARef {
  reset: () => void
  execute: () => Promise<string | null>
}

const ReCAPTCHAComponent = forwardRef<ReCAPTCHARef, ReCAPTCHAComponentProps>(({
  theme,
  onVerify,
  onExpired,
  onError,
  size = 'normal',
  className = ""
}, ref) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  // Экспонируем методы для родительского компонента
  useImperativeHandle(ref, () => ({
    reset: () => {
      recaptchaRef.current?.reset()
    },
    execute: async () => {
      return recaptchaRef.current?.executeAsync() || null
    }
  }))

  const handleChange = (token: string | null) => {
    onVerify(token)
  }

  const handleExpired = () => {
    onExpired?.()
  }

  const handleError = () => {
    onError?.()
  }

  // В реальном приложении здесь должен быть ваш Site Key от Google reCAPTCHA
  // Получить можно на https://www.google.com/recaptcha/admin
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Test key

  return (
    <div className={`flex justify-center ${className}`}>
      <div className={`
        p-2 rounded-lg border 
        ${theme === 'dark' 
          ? 'border-gray-600 bg-gray-800/30' 
          : 'border-gray-300 bg-white/30'
        }
      `}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          theme={theme}
          size={size}
          onChange={handleChange}
          onExpired={handleExpired}
          onError={handleError}
        />
      </div>
    </div>
  )
})

ReCAPTCHAComponent.displayName = 'ReCAPTCHA'

export default ReCAPTCHAComponent 