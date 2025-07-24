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
          {/* Google Tag Manager */}
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-KMRVH2GD');
              `,
            }}
          />
          {/* End Google Tag Manager */}
          
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
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe 
              src="https://www.googletagmanager.com/ns.html?id=GTM-KMRVH2GD"
              height="0" 
              width="0" 
              style={{display:'none',visibility:'hidden'}}
            />
          </noscript>
          {/* End Google Tag Manager (noscript) */}
          
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
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KMRVH2GD');
            `,
          }}
        />
        {/* End Google Tag Manager */}
        
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-KMRVH2GD"
            height="0" 
            width="0" 
            style={{display:'none',visibility:'hidden'}}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
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