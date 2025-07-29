import { NextRequest, NextResponse } from 'next/server';
import { handleExpiredImageUrl, checkImageUrlAccessibility, isTemporaryUrl } from '@/utils/imageUtils';
import fs from 'fs/promises';
import path from 'path';

// Project interface for type safety
interface Project {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  originalImageUrl?: string;
  userId?: string;
  status?: string;
  generatedImages?: string[];
  preferredStyles?: string[];
  restrictions?: string[];
  roomAnalysis?: any;
  designRecommendation?: any;
  threeDModel?: any;
  pdfReport?: any;
  shoppingList?: any;
  budget: any;
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions
async function readProjects(): Promise<Project[]> {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'projects.json');
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

async function writeProjects(projects: Project[]): Promise<void> {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'projects.json');
    const backupPath = `${dbPath}.backup.${Date.now()}`;
    
    // Create backup
    try {
      await fs.copyFile(dbPath, backupPath);
    } catch (backupError) {
      console.warn('Could not create backup:', backupError);
    }
    
    await fs.writeFile(dbPath, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing projects:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Fix All Expired Images] Starting batch fix process...');
    
    const body = await request.json();
    const { dryRun = false, maxConcurrent = 3 } = body;
    
    const projects = await readProjects();
    console.log(`[Fix All Expired Images] Found ${projects.length} projects to check`);
    
    const results = {
      checked: 0,
      expired: 0,
      fixed: 0,
      failed: 0,
      placeholders: 0,
      details: [] as any[]
    };
    
    // Process projects in batches to avoid overwhelming the system
    const batchSize = maxConcurrent;
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (project) => {
        const projectResult = {
          projectId: project.id,
          projectName: project.name,
          imageUrl: project.imageUrl,
          action: 'none' as string,
          newUrl: '',
          error: ''
        };
        
        try {
          if (project.imageUrl && isTemporaryUrl(project.imageUrl)) {
            results.checked++;
            
            console.log(`[Fix All Expired Images] Checking project ${project.id}: ${project.imageUrl}`);
            
            const accessCheck = await checkImageUrlAccessibility(project.imageUrl);
            
            if (!accessCheck.accessible) {
              results.expired++;
              projectResult.action = 'expired';
              
              if (!dryRun) {
                const fixResult = await handleExpiredImageUrl(project.imageUrl, project.id);
                
                if (fixResult.success && fixResult.localUrl) {
                  project.imageUrl = fixResult.localUrl;
                  project.updatedAt = new Date();
                  
                  results.fixed++;
                  projectResult.action = fixResult.isPlaceholder ? 'placeholder' : 'fixed';
                  projectResult.newUrl = fixResult.localUrl;
                  
                  if (fixResult.isPlaceholder) {
                    results.placeholders++;
                  }
                  
                  console.log(`✅ Fixed project ${project.id}: ${fixResult.localUrl}`);
                } else {
                  results.failed++;
                  projectResult.action = 'failed';
                  projectResult.error = fixResult.error || 'Unknown error';
                  console.log(`❌ Failed to fix project ${project.id}: ${fixResult.error}`);
                }
              }
            } else {
              projectResult.action = 'accessible';
            }
          }
          
          // Also check generated images array
          if (project.generatedImages && project.generatedImages.length > 0) {
            for (let j = 0; j < project.generatedImages.length; j++) {
              const imgUrl = project.generatedImages[j];
              if (isTemporaryUrl(imgUrl)) {
                const accessCheck = await checkImageUrlAccessibility(imgUrl);
                if (!accessCheck.accessible && !dryRun) {
                  const fixResult = await handleExpiredImageUrl(imgUrl, project.id);
                  if (fixResult.success && fixResult.localUrl) {
                    project.generatedImages[j] = fixResult.localUrl;
                  }
                }
              }
            }
          }
          
        } catch (error: any) {
          results.failed++;
          projectResult.action = 'error';
          projectResult.error = error.message;
          console.error(`❌ Error processing project ${project.id}:`, error);
        }
        
        results.details.push(projectResult);
      });
      
      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (i + batchSize < projects.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Save updated projects if not dry run
    if (!dryRun && results.fixed > 0) {
      await writeProjects(projects);
      console.log(`[Fix All Expired Images] Saved ${results.fixed} fixes to database`);
    }
    
    console.log('[Fix All Expired Images] Batch process completed:', results);
    
    return NextResponse.json({
      success: true,
      dryRun: dryRun,
      summary: {
        totalProjects: projects.length,
        checked: results.checked,
        expired: results.expired,
        fixed: results.fixed,
        failed: results.failed,
        placeholders: results.placeholders
      },
      details: results.details
    });
    
  } catch (error: any) {
    console.error('[Fix All Expired Images] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fix expired images',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Fix All Expired Images] Checking for expired images...');
    
    const projects = await readProjects();
    const expiredImages = [];
    
    for (const project of projects) {
      if (project.imageUrl && isTemporaryUrl(project.imageUrl)) {
        const accessCheck = await checkImageUrlAccessibility(project.imageUrl);
        if (!accessCheck.accessible) {
          expiredImages.push({
            projectId: project.id,
            projectName: project.name,
            imageUrl: project.imageUrl,
            status: accessCheck.status,
            error: accessCheck.error
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      totalProjects: projects.length,
      expiredImages: expiredImages.length,
      details: expiredImages
    });
    
  } catch (error: any) {
    console.error('[Fix All Expired Images] Error checking:', error);
    return NextResponse.json({ 
      error: 'Failed to check for expired images',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 