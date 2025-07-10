import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo purposes
// In production, use a database like PostgreSQL, MongoDB, etc.
let savedDesigns: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'
    
    // Filter designs by user
    const userDesigns = savedDesigns.filter(design => design.userId === userId)
    
    return NextResponse.json({
      success: true,
      designs: userDesigns
    })
  } catch (error) {
    console.error('Error fetching designs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      designImage, 
      suggestions, 
      parameters, 
      userId = 'default',
      name,
      description
    } = body

    if (!designImage) {
      return NextResponse.json(
        { error: 'Design image is required' },
        { status: 400 }
      )
    }

    const newDesign = {
      id: Date.now().toString(),
      userId,
      name: name || `${parameters.designType} ${parameters.roomType}`,
      description: description || `AI-generated design for ${parameters.roomType}`,
      designImage,
      suggestions,
      parameters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    }

    savedDesigns.push(newDesign)

    return NextResponse.json({
      success: true,
      design: newDesign
    })
  } catch (error) {
    console.error('Error saving design:', error)
    return NextResponse.json(
      { error: 'Failed to save design' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, isFavorite } = body

    const designIndex = savedDesigns.findIndex(design => design.id === id)
    
    if (designIndex === -1) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    // Update design
    savedDesigns[designIndex] = {
      ...savedDesigns[designIndex],
      name: name || savedDesigns[designIndex].name,
      description: description || savedDesigns[designIndex].description,
      isFavorite: isFavorite !== undefined ? isFavorite : savedDesigns[designIndex].isFavorite,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      design: savedDesigns[designIndex]
    })
  } catch (error) {
    console.error('Error updating design:', error)
    return NextResponse.json(
      { error: 'Failed to update design' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Design ID is required' },
        { status: 400 }
      )
    }

    const designIndex = savedDesigns.findIndex(design => design.id === id)
    
    if (designIndex === -1) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    savedDesigns.splice(designIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Design deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting design:', error)
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    )
  }
} 