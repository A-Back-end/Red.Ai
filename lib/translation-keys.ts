// lib/translations.ts
interface Translations {
  [key: string]: string;
}

const translations: Translations = {
  // Stepper translations
  uploadMainImage: 'Upload Main Image',
  add2DElements: 'Add 2D Elements',
  generationSettings: 'Generation Settings',
  
  // Step 1 translations
  startByUploading: 'Start by uploading your room photo',
  clickToChange: 'Click to change',
  dragDrop: 'Drag & drop your image here',
  browseFiles: 'browse files',
  supports: 'Supports JPG, PNG, WebP',
  
  // Step 2 translations
  uploadAdditionalElements: 'Upload additional elements or furniture',
  addFurniture: 'Add furniture and decor elements',
  multipleFiles: 'Multiple files supported',
  
  // General translations
  designStudio: 'Design Studio',
  createStunning: 'Create stunning interior designs with AI',
};

export const useTranslations = () => {
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return { t };
}; 