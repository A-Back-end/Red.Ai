import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/lib/theme-context'
import { TranslationsProvider } from '@/lib/translations'
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import AuthErrorHandler from '@/components/auth/AuthErrorHandler'

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
  // Check if Clerk is properly configured
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = clerkPublishableKey && !clerkPublishableKey.includes('your_clerk_publishable_key_here');
  
  // If Clerk is not configured, render without authentication
  if (!isClerkConfigured) {
    console.warn('⚠️ Clerk is not properly configured. Authentication will be disabled.');
    return (
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <head>
          {/* Google Analytics GA4 */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-KPN11Z30WN"
            strategy="afterInteractive"
          />
          <Script id="ga4-script" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KPN11Z30WN');
            `}
          </Script>
          {/* End Google Analytics GA4 */}
          
          {/* Umami Analytics */}
          <Script
            id="umami-script"
            strategy="afterInteractive"
            src="https://cloud.umami.is/script.js"
            data-website-id="18af50fe-7e10-4228-aaa5-9f3232c35043"
          />
          {/* End Umami Analytics */}
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
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KPN11Z30WN"
          strategy="afterInteractive"
        />
        <Script id="ga4-script" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KPN11Z30WN');
          `}
        </Script>
        {/* End Google Analytics GA4 */}
        
        {/* Umami Analytics */}
        <Script
          id="umami-script"
          strategy="afterInteractive"
          src="https://cloud.umami.is/script.js"
          data-website-id="18af50fe-7e10-4228-aaa5-9f3232c35043"
        />
        {/* End Umami Analytics */}
      </head>
      <body className="antialiased transition-colors duration-300">

        
        <ThemeProvider>
          <TranslationsProvider>
            <AuthErrorHandler>
              {children}
            </AuthErrorHandler>
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