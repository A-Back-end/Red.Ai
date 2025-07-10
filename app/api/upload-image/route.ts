import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// Step 1: Image upload setup
// Accepts JPEG/PNG images of apartments as input (user photos)
// Save the uploaded image to /public/uploads folder
export async function POST(request: NextRequest) {
  try {
    console.log('📁 Starting image upload...')
    
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG and PNG are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `apartment-${timestamp}-${originalName}`
    const filePath = path.join(uploadDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    fs.writeFileSync(filePath, buffer)

    // Return the public URL for the uploaded file
    const publicUrl = `/uploads/${filename}`
    
    console.log('✅ Image uploaded successfully:', publicUrl)
    
    return NextResponse.json({
      success: true,
      filename: filename,
      url: publicUrl,
      size: file.size,
      type: file.type,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('❌ Error uploading image:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Image Upload API',
    version: '1.0.0',
    supportedFormats: ['JPEG', 'PNG'],
    maxSize: '10MB',
    uploadPath: '/uploads'
  })
} 