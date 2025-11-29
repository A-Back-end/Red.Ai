import BeforeAfterShowcase from '@/components/landing/BeforeAfterShowcase'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">RED AI</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Home
              </a>
              <a href="/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <BeforeAfterShowcase />
        
        {/* Additional Features Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our AI-powered design process makes interior transformation simple and affordable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-upload text-purple-600 dark:text-purple-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  1. Upload Your Space
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Take a photo of your room or upload existing images
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-wand-magic-sparkles text-blue-600 dark:text-blue-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  2. AI Design Magic
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI analyzes your space and creates stunning designs
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-download text-green-600 dark:text-green-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  3. Get Your Design
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Compare before/after and download professional PDFs
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 RED AI. Transforming spaces with artificial intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 