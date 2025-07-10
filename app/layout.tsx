import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/lib/theme-context'
import { TranslationsProvider } from '@/lib/translations'
import { ClerkProvider } from '@clerk/nextjs'

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
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      signInUrl="/login"
      signUpUrl="/login"
    >
    <html lang="en" className="scroll-smooth dark">
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
                // Initialize theme sync system
                const theme = localStorage.getItem('theme') || 'dark';
                const language = localStorage.getItem('language') || 'en';
                
                // Apply theme
                document.documentElement.classList.remove('dark', 'light');
                document.documentElement.classList.add(theme);
                document.body.setAttribute('data-theme', theme);
                
                // Apply language
                document.documentElement.lang = language;
                
                console.log('🎨 Root layout theme sync initialized:', { theme, language });
              })();
            `,
          }}
        />
      </body>
    </html>
    </ClerkProvider>
  )
} 