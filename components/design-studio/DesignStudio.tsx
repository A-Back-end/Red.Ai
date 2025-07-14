'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Stepper from './Stepper';
import Step1Upload from './Step1Upload';
import Step2Elements from './Step2Elements';
import Step3Settings from './Step3Settings';
import { Loader2, Sparkles, Image as ImageIcon, CheckCircle, Save, X, FolderOpen, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useTranslation } from '@/lib/useTranslation';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export interface DesignSettings {
  prompt: string;
  inspirationWeight: string;
  design: string;
  apartmentStyle: string;
  roomType: string;
  budget: number;
}

type GenerationStatus = 'idle' | 'loading' | 'polling' | 'completed' | 'failed';

export default function DesignStudio() {
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [elementFiles, setElementFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<DesignSettings>({
    prompt: '',
    inspirationWeight: 'Medium',
    design: 'professional',
    apartmentStyle: 'modern',
    roomType: 'living-room',
    budget: 15000,
  });

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // Helper to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  // --- START: NEW ROBUST LOGIC ---

  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectSaveStatus, setProjectSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('%c[Polling] Polling stopped.', 'color: red;');
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Функция для сохранения проекта в базу данных
  const saveProjectToDatabase = async (imageUrl: string) => {
    if (!user) {
      console.warn('User not authenticated, cannot save project');
      return;
    }

    setProjectSaveStatus('saving');
    
    try {
      const newProject = {
        userId: user.id,
        name: settings.prompt?.substring(0, 50) || 'Design Studio Project',
        description: settings.prompt || `${settings.apartmentStyle} ${settings.roomType} design`,
        imageUrl: imageUrl,
        status: 'completed',
        generatedImages: [imageUrl],
        preferredStyles: [settings.apartmentStyle],
        budget: { 
          min: settings.budget, 
          max: settings.budget * 1.5, 
          currency: 'RUB' 
        },
        restrictions: [],
        roomAnalysis: {
          roomType: settings.roomType,
          dimensions: { width: 0, height: 0, area: 0 },
          features: [],
          lighting: 'natural',
          windows: 1,
          condition: 'good',
          recommendations: []
        }
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      const result = await response.json();
      
      if (result.success) {
        setSavedProjectId(result.project.id);
        setProjectSaveStatus('saved');
        console.log('✅ Project saved successfully:', result.project.id);
      } else {
        setProjectSaveStatus('error');
        console.error('❌ Failed to save project:', result.error);
      }
    } catch (error) {
      setProjectSaveStatus('error');
      console.error('❌ Error saving project:', error);
    }
  };

  const handleGenerate = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!user) {
      setErrorMessage('Please log in to generate designs.');
      setGenerationStatus('failed');
      return;
    }

    if (!mainImage) {
      setErrorMessage('Main image is required.');
      setGenerationStatus('failed');
      return;
    }

    console.log('%c[handleGenerate] Process started.', 'color: orange; font-weight: bold;');
    setGenerationStatus('loading');
    setErrorMessage(null);
    setFinalImageUrl(null);
    setProjectSaveStatus('idle');
    setSavedProjectId(null);
    stopPolling();

    try {
      const imageBase64 = await fileToBase64(mainImage);
      const prompt = settings.prompt;

      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start generation.');
      }

      if (!data.polling_url) {
        throw new Error('Server did not return a polling URL.');
      }

      console.log('%c[handleGenerate] Polling URL received. Starting polling process...', 'color: blue; font-weight: bold;');
      setGenerationStatus('polling');

      // Immediate first check
      const checkStatus = async () => {
        console.log('[Polling] Checking status...');
        try {
          const statusResponse = await fetch(`/api/check-status?url=${encodeURIComponent(data.polling_url)}`);
          const statusData = await statusResponse.json();

          console.log('[Polling] Status:', statusData);

          if (statusData.status === 'Ready') {
            stopPolling();
            if (statusData.result && statusData.result.sample) {
              setFinalImageUrl(statusData.result.sample);
              setGenerationStatus('completed');
              console.log('%c[Polling] Success! Image generated.', 'color: green;');
              
              // Сохраняем проект в базу данных после успешной генерации
              await saveProjectToDatabase(statusData.result.sample);
            } else {
              throw new Error('Generation succeeded but the result URL is missing.');
            }
          } else if (statusData.status === 'Failed') {
            stopPolling();
            setErrorMessage(statusData.details || 'Generation failed on the server.');
            setGenerationStatus('failed');
            console.error('[Polling] Generation failed:', statusData);
          }
        } catch (pollingError: any) {
          stopPolling();
          setErrorMessage(pollingError.message || 'Failed to check status.');
          setGenerationStatus('failed');
          console.error('[Polling] Critical error during status check:', pollingError);
        }
      };

      // Check immediately first
      await checkStatus();

      // Then start polling every 1.5 seconds
      pollingIntervalRef.current = setInterval(async () => {
        if (generationStatus === 'completed' || generationStatus === 'failed') {
            stopPolling();
            return;
        }
        await checkStatus();
      }, 1500);

    } catch (error: any) {
      console.error('[handleGenerate] A critical error occurred.', 'color: red; font-weight: bold;', error);
      setErrorMessage(error.message);
      setGenerationStatus('failed');
    }
  }, [mainImage, settings.prompt, stopPolling, user]);

  // --- END: NEW ROBUST LOGIC ---
  
  const handleStartOver = () => {
    setCurrentStep(1);
    setMainImage(null);
    setElementFiles([]);
    setFinalImageUrl(null);
    setErrorMessage(null);
    setGenerationStatus('idle');
    setProjectSaveStatus('idle');
    setSavedProjectId(null);
  };

  const handleGoToProjects = () => {
    // Переход на дашборд с автоматическим переключением на вкладку "My Projects"
    router.push('/dashboard?view=my-projects');
  };

  const handleViewProject = () => {
    if (savedProjectId) {
      router.push(`/project/${savedProjectId}`);
    }
  };

  const renderContent = () => {
    if (generationStatus === 'completed' && finalImageUrl) {
      return (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white light:text-gray-900 mb-4">
            {t('project_created')}
          </h2>
          <div className="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg">
            <img src={finalImageUrl} alt="Generated Design" className="w-full h-full object-contain" />
          </div>
          
          {/* Project Save Status */}
          <div className="mt-6 space-y-4">
            {projectSaveStatus === 'saving' && (
              <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving project...</span>
              </div>
            )}
            
            {projectSaveStatus === 'saved' && (
              <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Project saved successfully!</span>
              </div>
            )}
            
            {projectSaveStatus === 'error' && (
              <div className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
                <X className="w-5 h-5" />
                <span>Failed to save project</span>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-4 justify-center">
              <Button onClick={handleStartOver} variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('generate_design')}
              </Button>
              
              {projectSaveStatus === 'saved' && (
                <>
                  <Button onClick={handleGoToProjects} className="bg-amber-500 hover:bg-amber-600">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    View Projects
                  </Button>
                  
                  <Button onClick={handleViewProject} className="bg-green-500 hover:bg-green-600">
                    <Eye className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    if (generationStatus === 'failed') {
        return (
            <div className="text-center text-slate-900 dark:text-white">
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">{t('error_occurred')}</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{errorMessage}</p>
                <Button onClick={handleStartOver} className="mt-8">
                    {t('try_again')}
                </Button>
            </div>
        );
    }
    
    if (generationStatus === 'loading' || generationStatus === 'polling') {
        const loadingTexts = {
          loading: 'Preparing your design request...',
          polling: 'Generating your masterpiece...'
        };
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-900 dark:text-white">
              <Loader2 className="w-16 h-16 animate-spin mb-4 text-purple-500 dark:text-purple-400" />
              <h2 className="text-2xl font-bold">{t('generating')}</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">{t('loading')}</p>
            </div>
        );
    }

    switch (currentStep) {
      case 1:
        return <Step1Upload setMainImage={setMainImage} nextStep={nextStep} />;
      case 2:
        return <Step2Elements setElements={setElementFiles} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return (
          <Step3Settings
            settings={settings}
            setSettings={setSettings}
            onGenerate={handleGenerate}
            generationStatus={generationStatus}
            prevStep={prevStep}
            errorMessage={errorMessage}
            isAuthenticated={!!user}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white/90 dark:bg-gray-900/50 light:bg-gray-50/90 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 light:border-gray-300 backdrop-blur-xl">
      <div className="mb-8">
        <Stepper currentStep={currentStep} />
      </div>
      {renderContent()}
      {/* Пример: показываем слайдер сравнения, если есть обе картинки */}
      {/* Заменить beforeImage/afterImage на реальные пути после интеграции */}
      {finalImageUrl && (
        <BeforeAfterSlider beforeImage={'/img/img-1.jpg'} afterImage={finalImageUrl} />
      )}
    </div>
  );
} 