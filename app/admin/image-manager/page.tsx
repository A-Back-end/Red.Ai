import ImageManager from '@/components/admin/ImageManager'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default function ImageManagerPage() {
  return (
    <div className="container mx-auto py-8">
      <ImageManager />
    </div>
  )
} 