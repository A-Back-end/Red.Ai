import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/lib/theme-context'
import { TranslationsProvider } from '@/lib/translations'
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'RED AI - Revolutionary Real Estate Designer',
  description: 'Replace realtors and designers with AI. Find properties, design layouts, arrange furniture, and get renovation estimates — all in one intelligent platform.',
  keywords: 'real estate, AI, design, property, renovation, interior design, floor plans',
  authors: [{ name: 'RED AI Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily disable Clerk for development to fix the URL error
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return (
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <head>
          {/* Umami Analytics */}
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="18af50fe-7e10-4228-aaa5-9f3232c35043"
            strategy="afterInteractive"
          />
        </head>
        <body className="antialiased transition-colors duration-300">
          <ThemeProvider>
            <TranslationsProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </TranslationsProvider>
          </ThemeProvider>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    // Initialize theme sync system
                    const theme = localStorage.getItem('theme');
                    const language = localStorage.getItem('language') || 'en';
                    
                    // Apply theme to documentElement only if it exists in localStorage
                    if (theme && (theme === 'light' || theme === 'dark')) {
                      document.documentElement.classList.remove('dark', 'light');
                      document.documentElement.classList.add(theme);
                      document.documentElement.setAttribute('data-theme', theme);
                      document.body.classList.remove('dark', 'light');
                      document.body.classList.add(theme);
                    }
                    
                    // Apply language
                    document.documentElement.lang = language;
                    
                    console.log('🎨 Root layout theme sync initialized:', { theme, language });
                  } catch (e) {
                    console.warn('Theme initialization failed:', e);
                  }
                })();
              `,
            }}
          />
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInUrl="/login"
      signUpUrl="/login"
    >
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Umami Analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="18af50fe-7e10-4228-aaa5-9f3232c35043"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased transition-colors duration-300">
        <ThemeProvider>
          <TranslationsProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </TranslationsProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Initialize theme sync system
                  const theme = localStorage.getItem('theme');
                  const language = localStorage.getItem('language') || 'en';
                  
                  // Apply theme to documentElement only if it exists in localStorage
                  if (theme && (theme === 'light' || theme === 'dark')) {
                    document.documentElement.classList.remove('dark', 'light');
                    document.documentElement.classList.add(theme);
                    document.documentElement.setAttribute('data-theme', theme);
                    document.body.classList.remove('dark', 'light');
                    document.body.classList.add(theme);
                  }
                  
                  // Apply language
                  document.documentElement.lang = language;
                  
                  console.log('🎨 Root layout theme sync initialized:', { theme, language });
                } catch (e) {
                  console.warn('Theme initialization failed:', e);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
    </ClerkProvider>
  )
} 