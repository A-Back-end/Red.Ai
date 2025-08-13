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

// Enhanced error logging for debugging server issues
function logServerDetails(operation: string, error?: any) {
  console.log(`🔍 [${operation}] Server Environment Details:`, {
    platform: process.platform,
    nodeVersion: process.version,
    cwd: process.cwd(),
    dbPath,
    timestamp: new Date().toISOString(),
    error: error ? {
      message: error.message,
      code: error.code,
      errno: error.errno,
      path: error.path,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    } : undefined
  });
}

// Helper function to check file system permissions
async function checkFileSystemPermissions(): Promise<{ canRead: boolean; canWrite: boolean; details: any }> {
  const details: any = {
    dbPathExists: false,
    dbDirExists: false,
    dbDirPermissions: null,
    dbFilePermissions: null,
    diskSpace: null
  };

  try {
    // Check if database directory exists
    const dbDir = path.dirname(dbPath);
    try {
      const dbDirStats = await fs.stat(dbDir);
      details.dbDirExists = true;
      details.dbDirPermissions = {
        mode: dbDirStats.mode.toString(8),
        uid: dbDirStats.uid,
        gid: dbDirStats.gid
      };
    } catch {
      details.dbDirExists = false;
    }

    // Check if database file exists
    try {
      const dbFileStats = await fs.stat(dbPath);
      details.dbPathExists = true;
      details.dbFilePermissions = {
        mode: dbFileStats.mode.toString(8),
        uid: dbFileStats.uid,
        gid: dbFileStats.gid,
        size: dbFileStats.size
      };
    } catch {
      details.dbPathExists = false;
    }

    // Test read permissions
    let canRead = false;
    try {
      await fs.access(dbPath, fs.constants.R_OK);
      canRead = true;
    } catch {}

    // Test write permissions
    let canWrite = false;
    try {
      await fs.access(dbPath, fs.constants.W_OK);
      canWrite = true;
    } catch {}

    // If file doesn't exist, test directory write permissions
    if (!details.dbPathExists && details.dbDirExists) {
      try {
        await fs.access(dbDir, fs.constants.W_OK);
        canWrite = true;
      } catch {}
    }

    return { canRead, canWrite, details };
  } catch (error) {
    console.error('Error checking file system permissions:', error);
    return { canRead: false, canWrite: false, details };
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
    // Enhanced error logging for server debugging
    if (error.code === 'ENOENT') {
      console.log('Database file not found, creating new one');
      logServerDetails('READ_PROJECTS_ENOENT', error);
      return [];
    }
    
    logServerDetails('READ_PROJECTS_ERROR', error);
    console.error('Error reading projects:', error);
    throw error;
  }
}

// Helper function to write projects to the database with enhanced error handling
async function writeProjects(projects: Project[]): Promise<void> {
  try {
    await ensureDatabaseDirectory();
    console.log(`Writing ${projects.length} projects to database`);
    
    // Check permissions before attempting write
    const permissions = await checkFileSystemPermissions();
    console.log('File system permissions check:', permissions);
    
    if (!permissions.canWrite) {
      const error = new Error(`Cannot write to database: insufficient permissions. Details: ${JSON.stringify(permissions.details)}`);
      logServerDetails('WRITE_PROJECTS_PERMISSIONS', error);
      throw error;
    }
    
    // Create a backup before writing
    const backupPath = `${dbPath}.backup.${Date.now()}`;
    try {
      await fs.copyFile(dbPath, backupPath);
      console.log('Backup created:', backupPath);
    } catch (backupError: any) {
      console.warn('Could not create backup:', backupError);
      logServerDetails('WRITE_PROJECTS_BACKUP_FAILED', backupError);
    }
    
    // Write with atomic operation
    const tempPath = `${dbPath}.tmp`;
    console.log('Writing to temporary file:', tempPath);
    
    try {
      await fs.writeFile(tempPath, JSON.stringify(projects, null, 2), 'utf-8');
      console.log('Temporary file written, performing atomic rename...');
      
      await fs.rename(tempPath, dbPath);
      console.log(`Successfully wrote ${projects.length} projects to database`);
    } catch (writeError: any) {
      logServerDetails('WRITE_PROJECTS_ATOMIC_FAILED', writeError);
      
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {}
      
      throw writeError;
    }
    
  } catch (error: any) {
    logServerDetails('WRITE_PROJECTS_ERROR', error);
    console.error('Error writing projects to database:', error);
    
    // Try to restore from backup if available
    try {
      const dbDir = path.dirname(dbPath);
      const files = await fs.readdir(dbDir);
      const backupFiles = files
        .filter(f => f.startsWith('projects.json.backup.'))
        .sort()
        .reverse(); // Get most recent backup first
      
      if (backupFiles.length > 0) {
        const latestBackup = backupFiles[0];
        const backupFullPath = path.join(dbDir, latestBackup);
        
        try {
          await fs.copyFile(backupFullPath, dbPath);
          console.log('Restored from backup:', latestBackup);
        } catch (restoreError) {
          console.error('Failed to restore from backup:', restoreError);
          logServerDetails('WRITE_PROJECTS_RESTORE_FAILED', restoreError);
        }
      }
    } catch (backupListError) {
      console.error('Failed to list backup files:', backupListError);
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
    logServerDetails('GET_PROJECTS_ERROR', error);
    return NextResponse.json({ 
      error: 'Failed to get projects',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/projects - Starting request');
    logServerDetails('POST_PROJECTS_START');
    
    // Log request headers for debugging
    const headers = request.headers;
    console.log('POST /api/projects - Request headers:', {
      'content-type': headers.get('content-type'),
      'user-agent': headers.get('user-agent'),
      'referer': headers.get('referer'),
    });
    
    // Check file system permissions before proceeding
    const permissions = await checkFileSystemPermissions();
    console.log('POST /api/projects - File system check:', permissions);
    
    if (!permissions.canWrite) {
      console.error('POST /api/projects - Cannot write to database due to permissions');
      return NextResponse.json({ 
        error: 'Server configuration error: cannot write to database',
        details: process.env.NODE_ENV === 'development' ? permissions.details : undefined,
        serverInfo: process.env.NODE_ENV === 'development' ? {
          platform: process.platform,
          cwd: process.cwd(),
          dbPath
        } : undefined
      }, { status: 500 });
    }
    
    // Read current projects
    let PROJECTS_DB: Project[];
    try {
      PROJECTS_DB = await readProjects();
    } catch (readError) {
      console.error('POST /api/projects - Failed to read projects:', readError);
      logServerDetails('POST_PROJECTS_READ_ERROR', readError);
      return NextResponse.json({ 
        error: 'Failed to read existing projects',
        details: process.env.NODE_ENV === 'development' ? (readError as Error).message : undefined
      }, { status: 500 });
    }
    
    // Parse request body
    let projectData;
    try {
      projectData = await request.json();
      console.log('POST /api/projects - Received data keys:', Object.keys(projectData));
    } catch (parseError) {
      console.error('POST /api/projects - Failed to parse JSON:', parseError);
      logServerDetails('POST_PROJECTS_PARSE_ERROR', parseError);
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
    
    // Write to file with enhanced retry logic and detailed error reporting
    let writeSuccess = false;
    let writeError: Error | null = null;
    
    for (let attempt = 1; attempt <= 5; attempt++) { // Increased to 5 attempts
      try {
        console.log(`POST /api/projects - Write attempt ${attempt}/5`);
        await writeProjects(PROJECTS_DB);
        writeSuccess = true;
        console.log(`POST /api/projects - Write attempt ${attempt} succeeded`);
        break;
      } catch (error) {
        writeError = error as Error;
        console.error(`POST /api/projects - Write attempt ${attempt}/5 failed:`, error);
        logServerDetails(`POST_PROJECTS_WRITE_ATTEMPT_${attempt}`, error);
        
        if (attempt < 5) {
          // Exponential backoff: wait longer each time
          const waitTime = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s, 8s
          console.log(`POST /api/projects - Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!writeSuccess) {
      console.error('POST /api/projects - All write attempts failed');
      logServerDetails('POST_PROJECTS_ALL_WRITES_FAILED', writeError);
      
      // Additional diagnostics for server issues
      const finalPermissions = await checkFileSystemPermissions();
      
      return NextResponse.json({ 
        error: 'Failed to save project after multiple attempts',
        details: process.env.NODE_ENV === 'development' ? writeError?.message : undefined,
        serverDiagnostics: process.env.NODE_ENV === 'development' ? {
          attempts: 5,
          lastError: writeError?.message,
          errorCode: (writeError as any)?.code,
          permissions: finalPermissions,
          suggestions: [
            'Check server file permissions',
            'Ensure database directory is writable',
            'Verify sufficient disk space',
            'Check for file locks or concurrent access',
            'Consider switching to database storage'
          ]
        } : undefined
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
    logServerDetails('POST_PROJECTS_UNEXPECTED_ERROR', error);
    
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
    
    // Add detailed request logging
    const url = new URL(request.url);
    console.log('DELETE /api/projects - Request URL:', url.toString());
    console.log('DELETE /api/projects - Search params:', Object.fromEntries(url.searchParams));
    
    const PROJECTS_DB = await readProjects();
    console.log('DELETE /api/projects - Loaded projects count:', PROJECTS_DB.length);
    
    const { searchParams } = url;
    const projectId = searchParams.get('projectId');
    
    console.log('DELETE /api/projects - Project ID param:', projectId);
    
    if (!projectId) {
      console.error('DELETE /api/projects - Missing projectId');
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }
    
    // Validate projectId format
    if (typeof projectId !== 'string' || projectId.trim() === '') {
      console.error('DELETE /api/projects - Invalid projectId format:', projectId);
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }
    
    // Log all project IDs for debugging
    console.log('DELETE /api/projects - Available project IDs:', PROJECTS_DB.map(p => p.id));
    
    const projectIndex = PROJECTS_DB.findIndex(p => p.id === projectId);
    console.log('DELETE /api/projects - Project index found:', projectIndex);
    
    if (projectIndex === -1) {
      console.error('DELETE /api/projects - Project not found:', projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
         // Get project data before deletion for logging
     const deletedProject = PROJECTS_DB[projectIndex];
     console.log('DELETE /api/projects - Project to delete:', {
       id: deletedProject.id,
       name: deletedProject.name,
       userId: deletedProject.userId
     });
    
    // Remove project
    PROJECTS_DB.splice(projectIndex, 1);
    console.log('DELETE /api/projects - Project removed from array, new count:', PROJECTS_DB.length);
    
    // Attempt to write projects with detailed error handling
    try {
      await writeProjects(PROJECTS_DB);
      console.log('DELETE /api/projects - Successfully wrote projects to database');
    } catch (writeError: any) {
      console.error('DELETE /api/projects - Write error:', writeError);
      console.error('DELETE /api/projects - Write error stack:', writeError.stack);
      
      // Try to restore the project to the array
      PROJECTS_DB.splice(projectIndex, 0, deletedProject);
      console.log('DELETE /api/projects - Restored project to array after write failure');
      
      return NextResponse.json({ 
        error: 'Failed to save changes to database',
        details: process.env.NODE_ENV === 'development' ? writeError.message : undefined
      }, { status: 500 });
    }
    
    console.log('DELETE /api/projects - Successfully deleted project:', projectId);
    
         return NextResponse.json({ 
       success: true, 
       deletedProject: {
         id: deletedProject.id,
         name: deletedProject.name,
         userId: deletedProject.userId
       }
     });
    
  } catch (error: any) {
    console.error('DELETE /api/projects - Unexpected error:', error);
    console.error('DELETE /api/projects - Error stack:', error.stack);
    console.error('DELETE /api/projects - Error name:', error.name);
    console.error('DELETE /api/projects - Error type:', typeof error);
    
    // Log additional debugging info
    try {
      const url = new URL(request.url);
      console.error('DELETE /api/projects - Debug info:', {
        url: url.toString(),
        searchParams: Object.fromEntries(url.searchParams),
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      });
    } catch (debugError) {
      console.error('DELETE /api/projects - Failed to log debug info:', debugError);
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete project',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        stack: error.stack,
        type: typeof error
      } : undefined
    }, { status: 500 });
  }
} 