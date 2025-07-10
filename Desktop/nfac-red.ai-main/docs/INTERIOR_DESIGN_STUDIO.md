# Interior Design Studio Documentation

## Overview

Interior Design Studio is a complete AI-powered solution for transforming apartment photos into professionally designed interiors using Azure DALL-E 3.

## Features

### Step 1: Image Upload System ✅
- **API Endpoint**: `/api/upload-image`
- **Supported formats**: JPEG, PNG (up to 10MB)
- **Upload location**: `/public/uploads/`
- **File naming**: `apartment-{timestamp}-{originalname}`
- **Validation**: File type, size, and security checks

### Step 2: 2D Layout Support 🚧
*Currently a placeholder for future development*
- Will support floor plan uploads
- Integration with apartment layouts
- Enhanced spatial understanding

### Step 3: AI Interior Generation ✅
- **API Endpoint**: `/api/generate-design`
- **Model**: `dall-e-3`
- **Provider**: Azure OpenAI Service
- **Method**: Text-to-image generation
- **Output**: High-resolution interior designs

## Technical Architecture

### File Structure
```
├── app/
│   ├── api/
│   │   ├── upload-image/          # Step 1: File upload
│   │   │   └── route.ts
│   │   └── generate-design/             # Step 3: AI generation
│   │       └── route.ts
│   └── interior-design/           # Frontend page
│       └── page.tsx
├── components/
│   └── InteriorDesignStudio.tsx   # Main UI component
└── public/
    ├── uploads/                   # Uploaded apartment photos
    └── generated-images/          # AI-generated interiors
```

### API Endpoints

#### POST `/api/upload-image`
Upload apartment photos for interior design transformation.

**Request**: FormData with `image` field
```typescript
const formData = new FormData()
formData.append('image', file)
```

**Response**:
```json
{
  "success": true,
  "filename": "apartment-1734567890-photo.jpg",
  "url": "/uploads/apartment-1734567890-photo.jpg",
  "size": 2048576,
  "type": "image/jpeg",
  "message": "Image uploaded successfully"
}
```

#### POST `/api/stable-diffusion-generator`
Generate interior design using uploaded apartment image.

**Request**:
```json
{
  "prompt": "modern living room with natural lighting",
  "imageUrl": "/uploads/apartment-1734567890-photo.jpg",
  "style": "modern",
  "roomType": "living-room",
  "budgetLevel": "medium"
}
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "/generated-images/interior-modern-living-room-1734567890.png",
  "base64Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "metadata": {
    "model": "stable-diffusion-xl",
    "provider": "huggingface",
    "style": "modern",
    "roomType": "living-room",
    "enhancedPrompt": "modern, contemporary, minimalist apartment interior...",
    "estimatedCost": "$0.002"
  }
}
```

## Configuration

### Environment Variables

Create `.env.local` with:
```bash
# Hugging Face API Token
HF_TOKEN=YOUR_HUGGING_FACE_TOKEN_HERE
HF_API_KEY=YOUR_HUGGING_FACE_API_KEY_HERE

# Development URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Hugging Face API Token
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "Read" permissions
3. Copy the token (starts with `hf_`)
4. Add to your `.env.local` file

## Enhanced Prompt System

The system automatically enhances user prompts with interior design best practices:

### Base Prompt
```
modern, contemporary, minimalist apartment interior, clean lines, natural lighting, cozy and functional, smart furniture, cost-effective design, Scandinavian aesthetic, neutral tones, comfortable seating, entertainment area, plants, shelves, textures, subtle elegance, photorealistic, high-resolution
```

### Style Modifiers
- **Modern**: "modern, contemporary, clean lines, minimalist"
- **Scandinavian**: "scandinavian, hygge, natural materials, light wood, cozy"
- **Industrial**: "industrial, exposed brick, metal fixtures, urban loft"
- **Luxury**: "luxury, premium materials, elegant, sophisticated, high-end"
- **Minimalist**: "minimalist, simple, uncluttered, zen, functional"

## UI Components

### InteriorDesignStudio.tsx
Main component with three-step process:

1. **Image Upload Section**
   - Drag & drop file upload
   - Preview uploaded image
   - Upload progress and error handling

2. **Layout Placeholder Section** (Step 2 - Coming Soon)
   - Disabled/grayed out section
   - Placeholder for 2D floor plan uploads

3. **Generation Settings**
   - Custom prompt input
   - Style selection (5 options)
   - Room type selection
   - Budget level selection
   - Generate button with loading state

4. **Results Display**
   - Side-by-side comparison
   - Original vs Generated images
   - Download generated image option

## Dependencies

### Required npm packages:
```json
{
  "axios": "^1.6.0",
  "form-data": "^4.0.0"
}
```

### API Dependencies:
- Hugging Face Inference API
- Stable Diffusion XL model
- Next.js App Router (for file uploads)

## Usage Examples

### Basic Generation
```typescript
// Upload image first
const uploadResponse = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData
})

// Generate interior design
const generateResponse = await fetch('/api/stable-diffusion-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: uploadResponse.url,
    style: 'modern',
    roomType: 'living-room'
  })
})
```

### Custom Prompt Generation
```typescript
const response = await fetch('/api/stable-diffusion-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "luxury penthouse with floor-to-ceiling windows and marble finishes",
    imageUrl: "/uploads/apartment-123.jpg",
    style: "luxury",
    roomType: "living-room",
    budgetLevel: "high"
  })
})
```

## Cost Analysis

### Hugging Face Inference API
- **Cost**: ~$0.002 per generation
- **Speed**: 30-60 seconds per image
- **Quality**: High-resolution (1024x1024)
- **Advantages**: 
  - Much cheaper than OpenAI DALL-E 3 (~$0.04)
  - Open-source models
  - Good img2img capabilities

### Alternative: Replicate API
- **Cost**: ~$0.005 per generation
- **Speed**: 15-30 seconds per image
- **Quality**: Excellent
- **Model**: Same Stable Diffusion XL

## Error Handling

### Upload Errors
- File size validation (10MB limit)
- File type validation (JPEG/PNG only)
- Storage space checks
- Network timeout handling

### Generation Errors
- API key validation
- Model availability checks
- Input image processing errors
- Response format validation

## Future Enhancements (Roadmap)

### Step 2: 2D Layout Integration
- [ ] Floor plan upload support
- [ ] Room boundary detection
- [ ] Spatial layout preservation
- [ ] Integration with apartment layout APIs

### Advanced Features
- [ ] Multiple style mixing
- [ ] Furniture catalog integration
- [ ] Cost estimation per design
- [ ] 3D visualization export
- [ ] Virtual staging for real estate

### Performance Optimizations
- [ ] Image caching system
- [ ] Batch processing
- [ ] Background job queue
- [ ] CDN integration for generated images

## Testing

### Test the Upload API
```bash
curl -X POST http://localhost:3000/api/upload-image \
  -F "image=@apartment-photo.jpg"
```

### Test the Generation API
```bash
curl -X POST http://localhost:3000/api/stable-diffusion-generator \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "/uploads/apartment-test.jpg",
    "style": "modern",
    "roomType": "living-room"
  }'
```

### Frontend Testing
1. Navigate to `/interior-design`
2. Upload an apartment photo
3. Configure design settings
4. Click "Generate Interior Design"
5. Verify the generated result

## Security Considerations

- File upload validation (type, size, content)
- API key protection (server-side only)
- Input sanitization for prompts
- Rate limiting on API endpoints
- Storage cleanup for old files

## Troubleshooting

### Common Issues

1. **"HF_TOKEN not configured"**
   - Ensure `.env.local` has the correct token
   - Restart the development server

2. **Upload fails with 404**
   - Check that `/public/uploads/` directory exists
   - Verify API route is properly configured

3. **Generation takes too long**
   - Hugging Face models may be "cold starting"
   - First request after inactivity takes longer

4. **API permission errors**
   - Verify Hugging Face token has correct permissions
   - Check model availability and access rights

---

## Quick Start Guide

1. **Setup Environment**
   ```bash
   npm install axios form-data
   echo 'HF_TOKEN=YOUR_HUGGING_FACE_TOKEN_HERE' > .env.local
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test the System**
   - Open http://localhost:3000/interior-design
   - Upload an apartment photo
   - Generate your first AI interior design!

The Interior Design Studio provides a complete pipeline from image upload to AI-generated interior designs, making professional interior design accessible to everyone. 