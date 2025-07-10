'use client';

import React, { useState } from 'react';
import Step1Upload from './Step1Upload';
import Step2Elements from './Step2Elements';
import Step3Settings from './Step3Settings';
import Stepper from './Stepper';

interface DesignSettings {
  prompt: string;
  inspirationWeight: string;
  design: string;
  apartmentStyle: string;
  roomType: string;
  budget: number;
}

interface GeneratedResult {
  imageUrl: string;
  metadata?: any;
}

export default function DesignStudio() {
  const [step, setStep] = useState(1);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [elements, setElements] = useState<File[]>([]);
  const [settings, setSettings] = useState<DesignSettings>({
    prompt: '',
    inspirationWeight: 'Medium',
    design: 'none',
    apartmentStyle: 'modern',
    roomType: 'living-room',
    budget: 5000
  });
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleGenerate = async (finalSettings: DesignSettings) => {
    setIsGenerating(true);
    try {
      // Convert uploaded image to base64 if available
      let mainImageBase64 = '';
      if (mainImage) {
        const reader = new FileReader();
        mainImageBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(mainImage);
        });
      }

      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalSettings.prompt,
          apartmentStyle: finalSettings.apartmentStyle,
          roomType: finalSettings.roomType,
          budgetLevel: finalSettings.budget > 20000 ? 'high' : finalSettings.budget > 10000 ? 'medium' : 'low',
          budget: finalSettings.budget,
          quality: 'hd',
          size: '1024x1024',
          num_inference_steps: 40,
          guidance_scale: 7.5,
          mainImage: mainImageBase64,
          elements: [] // TODO: Add 2D elements from Step 2
        }),
      });

      const result = await response.json();
      
      if (result.success && result.imageUrl) {
        setGeneratedResult({
          imageUrl: result.imageUrl,
          metadata: result.metadata
        });
      } else {
        console.error('Generation failed:', result.error);
        alert('Failed to generate image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-800 dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl font-sans">
      <Stepper currentStep={step} />
      <div className="mt-8">
        {step === 1 && <Step1Upload setMainImage={setMainImage} nextStep={nextStep} />}
        {step === 2 && <Step2Elements setElements={setElements} nextStep={nextStep} prevStep={prevStep} />}
        {step === 3 && (
          <Step3Settings 
            prevStep={prevStep} 
            settings={settings}
            setSettings={setSettings}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
      </div>
      
      {/* Generated Result */}
      {generatedResult && (
        <div className="mt-8 border-t border-gray-600 pt-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">✨ Generated Design</h3>
          <div className="bg-gray-700/50 rounded-xl p-4">
            <img 
              src={generatedResult.imageUrl} 
              alt="Generated interior design" 
              className="w-full rounded-lg shadow-lg"
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Generated with Azure DALL-E 3 • Style: {settings.apartmentStyle} • Room: {settings.roomType}
              </p>
              <div className="flex justify-center space-x-2 mt-3">
                <button 
                  onClick={() => window.open(generatedResult.imageUrl, '_blank')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
                >
                  View Full Size
                </button>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedResult.imageUrl;
                    link.download = `design-${Date.now()}.png`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 