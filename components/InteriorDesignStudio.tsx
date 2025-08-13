'use client'

import { useState } from 'react'
import Image from 'next/image'

interface UploadResponse {
  success: boolean
  filename?: string
  url?: string
  size?: number
  type?: string
  message?: string
  error?: string
  details?: string
}

interface GenerationResponse {
  success: boolean
  imageUrl?: string
  base64Image?: string
  metadata?: any
  error?: string
  details?: string
}

export default function InteriorDesignStudio() {
  // Step 1: Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Step 2: Layout placeholder (skip for now)
  const [layoutImage, setLayoutImage] = useState<string | null>(null)

  // Step 3: Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Generation settings
  const [customPrompt, setCustomPrompt] = useState('')
  const [style, setStyle] = useState('modern')
  const [roomType, setRoomType] = useState('living-room')
  const [budgetLevel, setBudgetLevel] = useState('medium')

  // Step 1: Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      const result: UploadResponse = await response.json()

      if (result.success && result.url) {
        setUploadedImage(result.url)
        console.log('✅ Image uploaded successfully:', result.url)
      } else {
        setUploadError(result.error || 'Upload failed')
      }
    } catch (error) {
      setUploadError('Failed to upload image')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // Step 3: Handle interior generation
  const handleGeneration = async () => {
    if (!uploadedImage) {
      setGenerationError('Please upload an apartment image first')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setGeneratedImage(null)

    try {
      const requestBody = {
        prompt: customPrompt || undefined,
        imageUrl: uploadedImage,
        layoutUrl: layoutImage, // Step 2 placeholder
        style,
        roomType,
        budgetLevel
      }

      console.log('🎨 Starting generation with:', requestBody)

              const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const result: GenerationResponse = await response.json()

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl)
        console.log('✅ Interior generated successfully:', result.imageUrl)
        console.log('📊 Generation metadata:', result.metadata)
      } else {
        setGenerationError(result.error || 'Generation failed')
        console.error('❌ Generation failed:', result.details)
      }
    } catch (error) {
      setGenerationError('Failed to generate interior')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Interior Design Studio</h1>
        <p className="text-gray-600">Transform your apartment with AI-powered interior design</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel: Controls */}
        <div className="space-y-6">
          {/* Step 1: Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Upload Apartment Image</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <Image
                      src={uploadedImage}
                      alt="Uploaded apartment"
                      width={300}
                      height={200}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <p className="text-green-600">✅ Image uploaded successfully</p>
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="text-blue-600 hover:underline"
                    >
                      Upload different image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:underline">Upload an image</span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-sm text-gray-500">JPEG, PNG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              
              {isUploading && (
                <div className="text-center text-blue-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Uploading...</p>
                </div>
              )}
              
              {uploadError && (
                <div className="text-red-600 text-center">
                  <p>❌ {uploadError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Layout Placeholder */}
          <div className="bg-gray-50 rounded-lg shadow-md p-6 opacity-50">
            <h2 className="text-2xl font-semibold mb-4">Step 2: 2D Layout (Coming Soon)</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <rect x="8" y="8" width="32" height="32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 16h16v16H16V16z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-gray-400 mt-2">2D floor plan upload will be added here</p>
            </div>
          </div>

          {/* Step 3: Generation Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Step 3: Design Settings</h2>
            <div className="space-y-4">
              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Description (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your desired interior style..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interior Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="modern">Modern</option>
                  <option value="scandinavian">Scandinavian</option>
                  <option value="industrial">Industrial</option>
                  <option value="luxury">Luxury</option>
                  <option value="minimalist">Minimalist</option>
                </select>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="living-room">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="office">Office</option>
                </select>
              </div>

              {/* Budget Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Level
                </label>
                <select
                  value={budgetLevel}
                  onChange={(e) => setBudgetLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Budget-friendly ($500-$10k)</option>
                  <option value="medium">Mid-range ($10k-$20k)</option>
                  <option value="high">Luxury ($20k+)</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGeneration}
                disabled={!uploadedImage || isGenerating}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                  !uploadedImage || isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Interior...
                  </div>
                ) : (
                  '🎨 Generate Interior Design'
                )}
              </button>

              {generationError && (
                <div className="text-red-600 text-center">
                  <p>❌ {generationError}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="space-y-6">
          {/* Original Image */}
          {uploadedImage && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Original Apartment</h3>
              <Image
                src={uploadedImage}
                alt="Original apartment"
                width={500}
                height={300}
                className="w-full rounded-lg object-cover"
              />
            </div>
          )}

          {/* Generated Interior */}
          {generatedImage && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Generated Interior Design</h3>
              <Image
                src={generatedImage}
                alt="Generated interior"
                width={500}
                height={300}
                className="w-full rounded-lg object-cover"
              />
              <div className="mt-4 text-center">
                <a
                  href={generatedImage}
                  download
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📥 Download Image
                </a>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Generating...</h3>
              <div className="animate-pulse">
                <div className="bg-gray-200 rounded-lg w-full h-64"></div>
                <div className="mt-4 text-center text-gray-500">
                  <p>🎨 Creating your interior design...</p>
                  <p className="text-sm">This may take 30-60 seconds</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 