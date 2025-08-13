import { NextRequest, NextResponse } from 'next/server'
import { 
  updateProjectWithLocalImage, 
  updateAllProjectsWithLocalImages, 
  isTemporaryUrl 
} from '../../../utils/imageUtils'

// POST endpoint для обновления конкретного проекта
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, imageUrl } = body
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Updating project with local image:', projectId)
    
    const success = await updateProjectWithLocalImage(projectId, imageUrl)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Project updated successfully with local image',
        projectId: projectId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to update project with local image' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Error updating project:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint для массового обновления всех проектов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'update-all') {
      console.log('🔄 Starting mass update of all projects...')
      
      const result = await updateAllProjectsWithLocalImages()
      
      return NextResponse.json({
        success: true,
        message: 'Mass update completed',
        results: result,
        updated: result.updated,
        failed: result.failed
      })
    }
    
    // По умолчанию возвращаем информацию о том, сколько проектов нужно обновить
    const fs = require('fs')
    const path = require('path')
    
    const dbPath = path.join(process.cwd(), 'database', 'projects.json')
    const data = fs.readFileSync(dbPath, 'utf-8')
    const projects = JSON.parse(data)
    
    const temporaryProjects = projects.filter((project: any) => 
      project.imageUrl && isTemporaryUrl(project.imageUrl)
    )
    
    return NextResponse.json({
      success: true,
      message: 'Project analysis completed',
      totalProjects: projects.length,
      temporaryProjects: temporaryProjects.length,
      projectsToUpdate: temporaryProjects.map((p: any) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        isTemporary: isTemporaryUrl(p.imageUrl)
      }))
    })

  } catch (error) {
    console.error('❌ Error in mass update:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform mass update',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 