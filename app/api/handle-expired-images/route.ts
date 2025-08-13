import { NextRequest, NextResponse } from 'next/server';
import { handleExpiredImageUrl, checkImageUrlAccessibility } from '@/utils/imageUtils';

export async function POST(request: NextRequest) {
  try {
    console.log('[Handle Expired Images] API called');
    
    const body = await request.json();
    const { imageUrl, projectId } = body;
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'Image URL is required' 
      }, { status: 400 });
    }
    
    console.log('[Handle Expired Images] Processing URL:', imageUrl);
    
    // Check if the image URL is accessible
    const accessCheck = await checkImageUrlAccessibility(imageUrl);
    console.log('[Handle Expired Images] Access check result:', accessCheck);
    
    if (accessCheck.accessible) {
      // Image is still accessible, no action needed
      return NextResponse.json({
        success: true,
        action: 'no_change',
        imageUrl: imageUrl,
        message: 'Image URL is still accessible'
      });
    }
    
    // Handle the expired/inaccessible image
    const result = await handleExpiredImageUrl(imageUrl, projectId);
    console.log('[Handle Expired Images] Handle result:', result);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        action: result.isPlaceholder ? 'placeholder_created' : 'local_copy_found',
        originalUrl: imageUrl,
        newUrl: result.localUrl,
        filename: result.filename,
        isPlaceholder: result.isPlaceholder || false,
        message: result.isPlaceholder 
          ? 'Created placeholder for expired image'
          : 'Found local backup of image'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        originalUrl: imageUrl
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('[Handle Expired Images] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to handle expired image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'Image URL parameter is required' 
      }, { status: 400 });
    }
    
    console.log('[Handle Expired Images] Checking accessibility of:', imageUrl);
    
    const accessCheck = await checkImageUrlAccessibility(imageUrl);
    
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      accessible: accessCheck.accessible,
      status: accessCheck.status,
      error: accessCheck.error
    });
    
  } catch (error: any) {
    console.error('[Handle Expired Images] Error checking accessibility:', error);
    return NextResponse.json({ 
      error: 'Failed to check image accessibility',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 