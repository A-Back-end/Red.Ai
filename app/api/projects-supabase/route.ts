import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Project } from '@/lib/types';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Fallback to memory storage if Supabase is not configured
let memoryProjects: Project[] = [];

async function getSupabaseProjects(): Promise<Project[]> {
  if (!supabase) {
    console.log('Supabase not configured, using memory storage');
    return memoryProjects;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return memoryProjects;
    }

    return data.map((p: any) => ({
      ...p,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));
  } catch (error) {
    console.error('Supabase connection error:', error);
    return memoryProjects;
  }
}

async function saveSupabaseProject(project: Project): Promise<Project> {
  if (!supabase) {
    console.log('Supabase not configured, using memory storage');
    const existingIndex = memoryProjects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      memoryProjects[existingIndex] = { ...project, updatedAt: new Date() };
    } else {
      memoryProjects.push(project);
    }
    
    return project;
  }

  try {
    const projectData = {
      id: project.id,
      user_id: project.userId,
      name: project.name,
      description: project.description,
      image_url: project.imageUrl,
      status: project.status,
      generated_images: project.generatedImages,
      budget: project.budget,
      preferred_styles: project.preferredStyles,
      restrictions: project.restrictions,
      room_analysis: project.roomAnalysis,
      design_recommendation: project.designRecommendation,
      three_d_model: project.threeDModel,
      pdf_report: project.pdfReport,
      shopping_list: project.shoppingList,
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .upsert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Supabase save error:', error);
      // Fallback to memory storage
      const existingIndex = memoryProjects.findIndex(p => p.id === project.id);
      if (existingIndex >= 0) {
        memoryProjects[existingIndex] = { ...project, updatedAt: new Date() };
      } else {
        memoryProjects.push(project);
      }
      return project;
    }

    return {
      ...project,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Supabase connection error:', error);
    // Fallback to memory storage
    const existingIndex = memoryProjects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      memoryProjects[existingIndex] = { ...project, updatedAt: new Date() };
    } else {
      memoryProjects.push(project);
    }
    return project;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/projects-supabase - Starting request');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    
    const allProjects = await getSupabaseProjects();
    
    if (projectId) {
      const project = allProjects.find(p => p.id === projectId);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, project });
    }
    
    if (userId) {
      const userProjects = allProjects.filter(p => p.userId === userId);
      return NextResponse.json({ 
        success: true, 
        projects: userProjects,
        storage: supabase ? 'supabase' : 'memory'
      });
    }
    
    return NextResponse.json({ error: 'userId or projectId required' }, { status: 400 });
    
  } catch (error: any) {
    console.error('GET /api/projects-supabase - Error:', error);
    return NextResponse.json({ 
      error: 'Failed to get projects',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/projects-supabase - Starting request');
    
    const projectData = await request.json();
    
    // Validate project data
    if (!projectData.name || typeof projectData.name !== 'string') {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }
    
    // Create new project
    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: projectData.userId || 'anonymous',
      name: projectData.name,
      description: projectData.description || '',
      imageUrl: projectData.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: projectData.status || 'draft',
      generatedImages: projectData.generatedImages || [],
      budget: projectData.budget || { min: 50000, max: 200000, currency: 'RUB' },
      preferredStyles: projectData.preferredStyles || ['modern'],
      restrictions: projectData.restrictions || [],
      roomAnalysis: projectData.roomAnalysis || null,
      designRecommendation: projectData.designRecommendation || null,
      threeDModel: projectData.threeDModel || null,
      pdfReport: projectData.pdfReport || null,
      shoppingList: projectData.shoppingList || null
    };
    
    console.log('POST /api/projects-supabase - Saving project:', newProject.id);
    
    const savedProject = await saveSupabaseProject(newProject);
    
    console.log('POST /api/projects-supabase - Successfully saved project:', savedProject.id);
    
    return NextResponse.json({
      success: true,
      project: savedProject,
      storage: supabase ? 'supabase' : 'memory',
      message: supabase ? 'Project saved to Supabase' : 'Project saved to memory (temporary)'
    });
    
  } catch (error: any) {
    console.error('POST /api/projects-supabase - Error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to create project',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/projects-supabase - Starting request');
    
    const updateData = await request.json();
    const { projectId, ...updateFields } = updateData;
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }
    
    const allProjects = await getSupabaseProjects();
    const existingProject = allProjects.find(p => p.id === projectId);
    
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const updatedProject: Project = {
      ...existingProject,
      ...updateFields,
      updatedAt: new Date()
    };
    
    const savedProject = await saveSupabaseProject(updatedProject);
    
    console.log('PUT /api/projects-supabase - Successfully updated project:', projectId);
    
    return NextResponse.json({
      success: true,
      project: savedProject,
      storage: supabase ? 'supabase' : 'memory'
    });
    
  } catch (error: any) {
    console.error('PUT /api/projects-supabase - Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update project',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/projects-supabase - Starting request');
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }
    
    if (supabase) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) {
        console.error('Supabase delete error:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
      }
    } else {
      // Memory storage fallback
      const initialLength = memoryProjects.length;
      memoryProjects = memoryProjects.filter(p => p.id !== projectId);
      
      if (memoryProjects.length === initialLength) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
    }
    
    console.log('DELETE /api/projects-supabase - Successfully deleted project:', projectId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully',
      storage: supabase ? 'supabase' : 'memory'
    });
    
  } catch (error: any) {
    console.error('DELETE /api/projects-supabase - Error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete project',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 