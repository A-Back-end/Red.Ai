'use client';

import React, { useState, useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Moon, Sun, ArrowLeft, User, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/lib/theme-context';

const LanguageSwitcher = ({ language, setLanguage }: { language: 'en' | 'ru', setLanguage: (lang: 'en' | 'ru') => void }) => (
  <div className="flex bg-gray-200 dark:bg-slate-800 rounded-full p-1">
    <button
      onClick={() => setLanguage('en')}
      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
        language === 'en'
          ? 'bg-white dark:bg-slate-600 text-black dark:text-white'
          : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
      }`}
    >
      EN
    </button>
    <button
      onClick={() => setLanguage('ru')}
      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
        language === 'ru'
          ? 'bg-white dark:bg-slate-600 text-black dark:text-white'
          : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
      }`}
    >
      РУ
    </button>
  </div>
);


export const AuthForm = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { theme, language, toggleTheme, setLanguage } = useTheme();

  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();
  
  const isLoaded = signInLoaded && signUpLoaded;

  const validatePassword = (pass: string) => {
    if (pass.length > 0 && pass.length < 8) {
        setPasswordError(t.passwordLengthError);
    } else {
        setPasswordError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (activeTab === 'signup') {
        validatePassword(newPassword);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Отслеживаем вход в аналитику
        if (result.createdSessionId) {
          try {
            const { clerkAnalytics } = await import('@/lib/clerk-analytics');
            // Отслеживаем событие входа
            await clerkAnalytics.trackEvent({
              event: 'user_sign_in',
              userEmail: email,
              properties: {
                signInMethod: 'email',
                timestamp: new Date().toISOString(),
              },
            });
          } catch (analyticsError) {
            console.warn('Failed to track sign-in analytics:', analyticsError);
          }
        }
        
        router.push('/dashboard');
      } else {
        console.error(result);
        setError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors[0]?.message || 'An error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (password.length < 8) {
        setPasswordError(t.passwordLengthError);
        return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (activeTab === 'signup' && (!firstName || !lastName)) {
        setError('Please enter your first and last name.');
        return;
    }
    setIsLoading(true);
    setError('');
    setPasswordError('');
    
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });

        // Отслеживаем регистрацию в аналитику
        try {
          const { clerkAnalytics } = await import('@/lib/clerk-analytics');
          await clerkAnalytics.trackEvent({
            event: 'user_sign_up',
            userEmail: email,
            userName: `${firstName} ${lastName}`.trim(),
            properties: {
              signUpMethod: 'email',
              firstName,
              lastName,
              hasProfilePhoto: !!profilePhoto,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (analyticsError) {
          console.warn('Failed to track sign-up analytics:', analyticsError);
        }

        // User is now signed in. The dashboard can handle the photo upload
        // by checking for a photo in a global state or sessionStorage.
        if (profilePhoto) {
            // This is tricky without a user object. A better approach is
            // to handle the profile photo upload on a subsequent step,
            // like on the dashboard for the first time.
            // For now, we'll proceed without uploading the photo directly here.
            console.log("Photo selected, but upload will be handled on dashboard.");
        }
        
        router.push('/dashboard');
      } else {
        // Handle other statuses like 'missing_requirements' if needed
        console.error(result);
        setError('Could not complete sign up.');
      }

    } catch (err: any) {
      setError(err.errors[0]?.message || 'An error occurred during sign-up.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setProfilePhoto(file);
        setProfilePhotoPreview(URL.createObjectURL(file));
    }
  }
  
  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    try {
      // Отслеживаем попытку входа через Google
      try {
        const { clerkAnalytics } = await import('@/lib/clerk-analytics');
        await clerkAnalytics.trackEvent({
          event: 'google_sign_in_attempt',
          userEmail: email,
          properties: {
            timestamp: new Date().toISOString(),
          },
        });
      } catch (analyticsError) {
        console.warn('Failed to track Google sign-in attempt:', analyticsError);
      }

      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: any) {
      setError(err.errors[0]?.message || 'Failed to sign in with Google.');
    }
  };


  const translations = {
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      welcomeBack: 'Welcome Back!',
      signInContinue: 'Sign in to continue to your dashboard',
      signUpToStart: 'Create your account',
      email: 'Email',
      enterEmail: 'Enter your email',
      password: 'Password',
      enterPassword: 'Enter password',
      confirmPassword: 'Confirm Password',
      passwordLengthError: 'Password must be at least 8 characters.',
      orContinueWith: 'OR CONTINUE WITH',
      continueWithGoogle: 'Continue with Google',
      terms: 'By continuing, you agree to our Terms of Service and Privacy Policy',
      backToHome: 'Back to Home',
      firstName: 'First Name',
      lastName: 'Last Name',
    },
    ru: {
      signIn: 'Вход',
      signUp: 'Регистрация',
      welcomeBack: 'С возвращением!',
      signInContinue: 'Войдите, чтобы продолжить',
      signUpToStart: 'Создайте свой аккаунт',
      email: 'Эл. почта',
      enterEmail: 'Введите вашу эл. почту',
      password: 'Пароль',
      enterPassword: 'Введите пароль',
      confirmPassword: 'Подтвердите пароль',
      passwordLengthError: 'Пароль должен содержать не менее 8 символов.',
      orContinueWith: 'ИЛИ ПРОДОЛЖАЙТЕ С',
      continueWithGoogle: 'Продолжить с Google',
      terms: 'Продолжая, вы соглашаетесь с нашими Условиями обслуживания и Политикой конфиденциальности.',
      backToHome: 'Вернуться на главную',
      firstName: 'Имя',
      lastName: 'Фамилия',
    },
  };

  const t = translations[language];

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-4 transition-colors font-sans`}>
      <div className="absolute top-4 left-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-black dark:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-black dark:text-white">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher language={language} setLanguage={setLanguage} />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('signin')}
              className={`w-1/2 p-4 font-semibold transition-colors ${
                activeTab === 'signin'
                  ? 'text-blue-600 dark:text-teal-400 border-b-2 border-blue-600 dark:border-teal-400 bg-blue-50 dark:bg-slate-700'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'
              }`}
            >
              {t.signIn}
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`w-1/2 p-4 font-semibold transition-colors ${
                activeTab === 'signup'
                  ? 'text-blue-600 dark:text-teal-400 border-b-2 border-blue-600 dark:border-teal-400 bg-blue-50 dark:bg-slate-700'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'
              }`}
            >
              {t.signUp}
            </button>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'signin' ? t.welcomeBack : t.signUpToStart}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {activeTab === 'signin' ? t.signInContinue : ''}
              </p>
            </div>
            
            <form onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {activeTab === 'signup' && (
                <>
                    <div className="flex justify-center">
                        <label htmlFor="photo-upload" className="cursor-pointer relative">
                            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-400 dark:border-gray-500">
                                {profilePhotoPreview ? (
                                    <img src={profilePhotoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </label>
                        <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </div>
                  <div className="flex gap-4">
                    <div className="w-1/2 space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">{t.firstName}</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder={t.firstName}
                        value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                        required
                        className="bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="w-1/2 space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">{t.lastName}</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder={t.lastName}
                        value={lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                        required
                        className="bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.enterEmail}
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  className="bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.enterPassword}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className={`bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              </div>
              
              {activeTab === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">{t.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t.confirmPassword}
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-blue-600 hover:opacity-90 transition-opacity text-white font-bold py-3" disabled={isLoading}>
                {isLoading ? 'Loading...' : (activeTab === 'signin' ? t.signIn : t.signUp)}
              </Button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="mx-4 text-xs text-gray-500 dark:text-gray-400">{t.orContinueWith}</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <Button variant="outline" className="w-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600" onClick={handleGoogleSignIn}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.591,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              {t.continueWithGoogle}
            </Button>
            
            <p className="mt-8 text-xs text-center text-gray-500 dark:text-gray-400">{t.terms}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 