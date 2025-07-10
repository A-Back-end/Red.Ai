# Azure DALL-E 3 Prompt Structure for Interior Design

## Overview

This document describes the comprehensive prompt structure used in RED AI for generating interior design images with Azure DALL-E 3. The system combines user inputs from the Design Studio's three-step process to create optimized prompts.

## Three-Step Process Integration

### Step 1: Main Room Image Upload (Implicit)
The user provides a main room image as foundational context. While DALL-E 3 doesn't support direct img2img, we incorporate the spatial understanding from the uploaded image into the prompt description.

### Step 2: 2D Elements (Optional)
Optional 2D elements are seamlessly integrated into the prompt to ensure they blend naturally with the overall aesthetic.

### Step 3: Generation Settings (Explicit)
User-provided settings and prompts are combined to create the final comprehensive prompt.

## Prompt Template Structure

```javascript
function buildDallePrompt(userInput) {
  return `Generate a high-quality, professional interior design image of a ${userInput.roomType} in a ${userInput.apartmentStyle} aesthetic. The design should incorporate ${userInput.designNew || 'modern furniture and fixtures'}. The overall ambiance should align with a budget between $${userInput.budgetMin} and $${userInput.budgetMax}, reflecting realistic choices for this price range.

${userInput.customPrompt} Ensure the design is a highly realistic 3D render${userInput.designType === 'SketchUp' ? ', styled like a clean SketchUp visualization' : userInput.designType === 'Rooming' ? ', focusing on spatial layout and room arrangement' : ''}. Consider existing room proportions and seamlessly integrate ${userInput.has2DElements ? 'provided 2D design elements' : 'cohesive design elements'}. Focus on ${extractKeyElements(userInput.customPrompt)}. The final image should be well-lit, visually appealing, and inspiring for a renovation project.`;
}
```

## Input Parameters Mapping

### From Design Studio UI:

| UI Field | Parameter | DALL-E 3 Integration |
|----------|-----------|---------------------|
| Room Type | `roomType` | "Living Room", "Bedroom", "Kitchen", etc. |
| Apartment Style | `apartmentStyle` | "Modern", "Scandinavian", "Industrial", etc. |
| Design NEW | `designNew` | Specific layouts, built-in features |
| Budget Slider | `budgetMin`, `budgetMax` | "$500 to $5,000" for prompt context |
| Design Type | `designType` | "3D", "SketchUp", "Rooming" |
| Custom Prompt | `customPrompt` | User's detailed description |
| Link (Optional) | `inspirationLink` | Contextual style references |

## Example Prompt Generation

### User Input:
```json
{
  "roomType": "Living Room",
  "apartmentStyle": "Modern",
  "designNew": "Open concept with a large L-shaped sofa and a minimalist fireplace",
  "budgetMin": 5000,
  "budgetMax": 10000,
  "designType": "3D",
  "customPrompt": "A sleek and inviting modern living room with a neutral color palette of greys and whites, accented with natural wood elements. Include warm, recessed lighting and a large window showcasing a city view. The sofa should be light grey with clean lines."
}
```

### Generated DALL-E 3 Prompt:
```
Generate a high-quality, professional interior design image of a Living Room in a Modern aesthetic. The design should incorporate an open concept with a large L-shaped sofa and a minimalist fireplace. The overall ambiance should align with a budget between $5,000 and $10,000, reflecting realistic choices for this price range.

A sleek and inviting modern living room with a neutral color palette of greys and whites, accented with natural wood elements. Include warm, recessed lighting and a large window showcasing a city view. The sofa should be light grey with clean lines. Ensure the design is a highly realistic 3D render. Consider existing room proportions and seamlessly integrate cohesive design elements. Focus on neutral color palette, natural wood accents, warm recessed lighting, large window, and light grey L-shaped sofa with clean lines. The final image should be well-lit, visually appealing, and inspiring for a renovation project.
```

## Prompt Enhancement Logic

### Automatic Enhancements:
1. **Quality Descriptors**: "High quality, professional interior design, realistic lighting, detailed textures"
2. **Interior Context**: Ensures prompts are clearly interior-focused
3. **Budget Realism**: Guides AI toward appropriate material and fixture choices
4. **Style Consistency**: Maintains coherence with selected apartment style
5. **Technical Quality**: Ensures professional photography appearance

### Style-Specific Additions:

| Style | Additional Context |
|-------|-------------------|
| Modern | "clean lines, minimalist aesthetic, contemporary materials" |
| Scandinavian | "natural wood, cozy textures, hygge atmosphere, light colors" |
| Industrial | "exposed brick, metal fixtures, urban loft aesthetic" |
| Minimalist | "clean spaces, neutral palette, functional design" |
| Bohemian | "eclectic patterns, rich textures, artistic elements" |
| Traditional | "classic furniture, warm colors, timeless elegance" |

## Room Type Optimizations:

| Room Type | Specific Focus |
|-----------|----------------|
| Living Room | "comfortable seating area, entertainment space" |
| Bedroom | "peaceful sleeping area, relaxing atmosphere" |
| Kitchen | "functional cooking space, modern appliances" |
| Bathroom | "spa-like fixtures, modern amenities" |
| Office | "productive workspace, ergonomic furniture" |
| Dining Room | "elegant dining setup, social gathering space" |

## Budget Level Integration:

| Budget Level | Price Range | Prompt Context |
|--------------|-------------|----------------|
| Low | $500-$5,000 | "budget-friendly furnishings, smart shopping choices" |
| Medium | $5,000-$15,000 | "quality mid-range furniture, balanced materials" |
| High | $15,000+ | "luxury materials, premium designer furniture" |

## Technical Implementation

### Code Structure:
```typescript
// app/api/generate-design/route.ts
function createInteriorDesignPrompt(customPrompt?: string, style?: string): string {
  const basePrompt = customPrompt || "Modern interior design with comfortable furniture and good lighting";
  
  const styleEnhancements = {
    modern: "sleek contemporary design with clean lines, premium materials, and minimalist aesthetic",
    scandinavian: "cozy Scandinavian design with natural wood, light colors, and hygge atmosphere",
    industrial: "urban industrial design with exposed elements, metal fixtures, and loft aesthetic",
    minimalist: "pure minimalist design with clean spaces, neutral palette, and functional approach"
  };
  
  const enhancement = styleEnhancements[style] || styleEnhancements.modern;
  
  return `${basePrompt}, ${enhancement}, high quality professional interior design, realistic lighting, detailed textures, well-composed, inspiring renovation aesthetic`;
}
```

### Azure DALL-E 3 Configuration:
```typescript
const AZURE_CONFIG = {
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://neuroflow-hub.openai.azure.com',
  apiVersion: '2024-04-01-preview',
  deploymentName: 'dall-e-3'
};
```

## Best Practices

### Prompt Optimization:
1. **Clarity**: Be specific about desired elements
2. **Coherence**: Maintain consistent style throughout
3. **Realism**: Include budget-appropriate suggestions
4. **Context**: Reference spatial relationships and lighting
5. **Quality**: Always include professional photography descriptors

### Error Handling:
1. **Prompt Length**: Max 4000 characters for DALL-E 3
2. **Content Policy**: Avoid restricted content
3. **Fallbacks**: Graceful degradation if generation fails
4. **Retry Logic**: Handle API rate limits

## Integration Points

### Design Studio Flow:
```
User Upload → Element Selection → Settings → Prompt Generation → DALL-E 3 → Image Processing → Save & Display
```

### API Endpoints:
- `POST /api/generate-design` - Main generation endpoint
- `GET /api/generate-design` - Health check and configuration

## Performance Considerations

- **Cost**: $0.04 per standard image, $0.08 per HD image
- **Speed**: ~10-30 seconds generation time
- **Quality**: Standard (1024x1024) or HD quality options
- **Limits**: Rate limits apply based on Azure OpenAI subscription

## Future Enhancements

1. **Style Transfer**: Incorporate room image analysis
2. **Multi-angle Generation**: Generate multiple viewpoints
3. **Material Recognition**: AI-powered material suggestions
4. **Color Palette Extraction**: Automatic color scheme generation 