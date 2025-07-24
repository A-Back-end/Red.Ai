import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Path to the JSON database file
const dbPath = path.join(process.cwd(), 'database', 'projects.json');

// Helper function to ensure database directory exists
async function ensureDatabaseDirectory(): Promise<void> {
  const dbDir = path.dirname(dbPath);
  try {
    await fs.access(dbDir);
    console.log('Database directory exists:', dbDir);
  } catch {
    console.log('Creating database directory:', dbDir);
    await fs.mkdir(dbDir, { recursive: true });
  }
}

// Helper function to read projects from the database
async function readProjects(): Promise<Project[]> {
  try {
    await ensureDatabaseDirectory();
    console.log('Reading projects from:', dbPath);
    
    const data = await fs.readFile(dbPath, 'utf-8');
    const projects = JSON.parse(data);
    
    console.log(`Successfully read ${projects.length} projects from database`);
    
    // It's important to parse dates back into Date objects
    return projects.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (error: any) {
    // If the file doesn't exist, return an empty array
    if (error.code === 'ENOENT') {
      console.log('Database file not found, creating new one');
      return [];
    }
    console.error('Error reading projects:', error);
    throw error;
  }
}

// Helper function to write projects to the database
async function writeProjects(projects: Project[]): Promise<void> {
  try {
    await ensureDatabaseDirectory();
    console.log(`Writing ${projects.length} projects to database`);
    
    // Create a backup before writing
    const backupPath = `${dbPath}.backup.${Date.now()}`;
    try {
      await fs.copyFile(dbPath, backupPath);
      console.log('Backup created:', backupPath);
    } catch (backupError) {
      console.warn('Could not create backup:', backupError);
    }
    
    // Write with atomic operation
    const tempPath = `${dbPath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(projects, null, 2), 'utf-8');
    await fs.rename(tempPath, dbPath);
    
    console.log(`Successfully wrote ${projects.length} projects to database`);
  } catch (error) {
    console.error('Error writing projects to database:', error);
    
    // Try to restore from backup if available
    const backupFiles = await fs.readdir(path.dirname(dbPath));
    const latestBackup = backupFiles
      .filter(f => f.startsWith('projects.json.backup.'))
      .sort()
      .pop();
    
    if (latestBackup) {
      try {
        await fs.copyFile(path.join(path.dirname(dbPath), latestBackup), dbPath);
        console.log('Restored from backup:', latestBackup);
      } catch (restoreError) {
        console.error('Failed to restore from backup:', restoreError);
      }
    }
    
    throw error;
  }
}

// Validation function for project data
function validateProjectData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('Project data is required');
    return { isValid: false, errors };
  }
  
  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Project name is required');
  }
  
  if (data.userId && typeof data.userId !== 'string') {
    errors.push('userId must be a string');
  }
  
  if (data.budget && typeof data.budget !== 'object') {
    errors.push('budget must be an object');
  }
  
  return { isValid: errors.length === 0, errors };
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/projects - Starting request');
    
    const PROJECTS_DB = await readProjects();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId')
    const projectId = searchParams.get('projectId')
    
    console.log('GET /api/projects - Params:', { userId, projectId });
    
    if (projectId) {
      // Get specific project
      const project = PROJECTS_DB.find(p => p.id === projectId)
      if (!project) {
        console.log('GET /api/projects - Project not found:', projectId);
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      console.log('GET /api/projects - Returning project:', projectId);
      return NextResponse.json({ success: true, project })
    }
    
    if (userId) {
      // Get all projects for user
      const userProjects = PROJECTS_DB.filter(p => p.userId === userId)
      console.log('GET /api/projects - Returning user projects:', userId, userProjects.length);
      return NextResponse.json({ 
        success: true, 
        projects: userProjects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      })
    }
    
    console.log('GET /api/projects - Missing required params');
    return NextResponse.json({ error: 'userId or projectId required' }, { status: 400 })
    
  } catch (error: any) {
    console.error('GET /api/projects - Error:', error);
    return NextResponse.json({ 
      error: 'Failed to get projects',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/projects - Starting request');
    
    // Read current projects
    let PROJECTS_DB: Project[];
    try {
      PROJECTS_DB = await readProjects();
    } catch (readError) {
      console.error('POST /api/projects - Failed to read projects:', readError);
      return NextResponse.json({ 
        error: 'Failed to read existing projects',
        details: process.env.NODE_ENV === 'development' ? (readError as Error).message : undefined
      }, { status: 500 });
    }
    
    // Parse request body
    let projectData;
    try {
      projectData = await request.json();
      console.log('POST /api/projects - Received data:', JSON.stringify(projectData, null, 2));
    } catch (parseError) {
      console.error('POST /api/projects - Failed to parse JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    // Validate project data
    const validation = validateProjectData(projectData);
    if (!validation.isValid) {
      console.error('POST /api/projects - Validation failed:', validation.errors);
      return NextResponse.json({ 
        error: 'Invalid project data', 
        details: validation.errors 
      }, { status: 400 });
    }
    
    // Create new project
    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: projectData.userId || 'anonymous',
      name: projectData.name || 'Новый проект',
      description: projectData.description || '',
      imageUrl: projectData.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: projectData.status || 'draft',
      generatedImages: projectData.generatedImages || [],
      budget: projectData.budget || { min: 50000, max: 200000, currency: 'RUB' },
      preferredStyles: projectData.preferredStyles || ['modern'],
      restrictions: projectData.restrictions || [],
      
      // Room analysis data
      roomAnalysis: projectData.roomAnalysis || null,
      
      // Design recommendation data  
      designRecommendation: projectData.designRecommendation || null,
      
      // 3D Model data
      threeDModel: projectData.threeDModel || null,
      
      // Export data
      pdfReport: projectData.pdfReport || null,
      shoppingList: projectData.shoppingList || null
    }
    
    console.log('POST /api/projects - Created project object:', {
      id: newProject.id,
      name: newProject.name,
      userId: newProject.userId,
      hasRoomAnalysis: !!newProject.roomAnalysis,
      hasDesignRecommendation: !!newProject.designRecommendation,
      status: newProject.status
    });
    
    // Add to database
    PROJECTS_DB.push(newProject)
    
    // Write to file with retry logic
    let writeSuccess = false;
    let writeError: Error | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await writeProjects(PROJECTS_DB);
        writeSuccess = true;
        break;
      } catch (error) {
        writeError = error as Error;
        console.error(`POST /api/projects - Write attempt ${attempt} failed:`, error);
        
        if (attempt < 3) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    if (!writeSuccess) {
      console.error('POST /api/projects - All write attempts failed');
      return NextResponse.json({ 
        error: 'Failed to save project after multiple attempts',
        details: process.env.NODE_ENV === 'development' ? writeError?.message : undefined
      }, { status: 500 });
    }
    
    console.log('POST /api/projects - Successfully created project:', newProject.id);
    
    return NextResponse.json({
      success: true,
      project: newProject
    })
    
  } catch (error: any) {
    console.error('POST /api/projects - Error:', error);
    console.error('POST /api/projects - Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Failed to create project',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/projects - Starting request');
    
    // Read current projects
    let PROJECTS_DB: Project[];
    try {
      PROJECTS_DB = await readProjects();
    } catch (readError) {
      console.error('PUT /api/projects - Failed to read projects:', readError);
      return NextResponse.json({ 
        error: 'Failed to read existing projects',
        details: process.env.NODE_ENV === 'development' ? (readError as Error).message : undefined
      }, { status: 500 });
    }
    
    let updateData;
    try {
      updateData = await request.json();
      console.log('PUT /api/projects - Received data:', JSON.stringify(updateData, null, 2));
    } catch (parseError) {
      console.error('PUT /api/projects - Failed to parse JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { projectId, ...updateFields } = updateData;
    
    if (!projectId) {
      console.error('PUT /api/projects - Missing projectId');
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }
    
    const projectIndex = PROJECTS_DB.findIndex(p => p.id === projectId)
    if (projectIndex === -1) {
      console.error('PUT /api/projects - Project not found:', projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // Update project with new data
    PROJECTS_DB[projectIndex] = {
      ...PROJECTS_DB[projectIndex],
      ...updateFields,
      updatedAt: new Date()
    }
    
    // Write to file with retry logic
    let writeSuccess = false;
    let writeError: Error | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await writeProjects(PROJECTS_DB);
        writeSuccess = true;
        break;
      } catch (error) {
        writeError = error as Error;
        console.error(`PUT /api/projects - Write attempt ${attempt} failed:`, error);
        
        if (attempt < 3) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    if (!writeSuccess) {
      console.error('PUT /api/projects - All write attempts failed');
      return NextResponse.json({ 
        error: 'Failed to update project after multiple attempts',
        details: process.env.NODE_ENV === 'development' ? writeError?.message : undefined
      }, { status: 500 });
    }
    
    console.log('PUT /api/projects - Successfully updated project:', projectId);
    
    return NextResponse.json({
      success: true,
      project: PROJECTS_DB[projectIndex]
    })
    
  } catch (error: any) {
    console.error('PUT /api/projects - Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update project',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/projects - Starting request');
    
    const PROJECTS_DB = await readProjects();
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      console.error('DELETE /api/projects - Missing projectId');
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }
    
    const projectIndex = PROJECTS_DB.findIndex(p => p.id === projectId)
    if (projectIndex === -1) {
      console.error('DELETE /api/projects - Project not found:', projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // Remove project
    const deletedProject = PROJECTS_DB[projectIndex]
    PROJECTS_DB.splice(projectIndex, 1)
    await writeProjects(PROJECTS_DB);
    
    console.log('DELETE /api/projects - Successfully deleted project:', projectId);
    
    return NextResponse.json({ success: true, deletedProject })
    
  } catch (error: any) {
    console.error('DELETE /api/projects - Error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete project',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
} 