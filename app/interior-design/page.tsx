import InteriorDesignStudio from '@/components/InteriorDesignStudio'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default function InteriorDesignPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InteriorDesignStudio />
    </div>
  )
}

export const metadata = {
  title: 'Interior Design Studio - Transform Your Apartment with AI',
  description: 'Upload your apartment photos and generate stunning interior designs using AI-powered Azure DALL-E 3'
} 