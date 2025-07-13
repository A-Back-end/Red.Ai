'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Stepper from './Stepper';
import Step1Upload from './Step1Upload';
import Step2Elements from './Step2Elements';
import Step3Settings from './Step3Settings';
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useTranslation } from '@/lib/useTranslation';

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

  const handleGenerate = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!mainImage) {
      setErrorMessage('Main image is required.');
      setGenerationStatus('failed');
      return;
    }

    console.log('%c[handleGenerate] Process started.', 'color: orange; font-weight: bold;');
    setGenerationStatus('loading');
    setErrorMessage(null);
    setFinalImageUrl(null);
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

          if (statusData.status === 'Ready') { // <-- FIX: Check for 'Ready'
            stopPolling();
            // FIX: Get image URL from correct path `result.sample`
            if (statusData.result && statusData.result.sample) {
              setFinalImageUrl(statusData.result.sample);
              setGenerationStatus('completed');
              console.log('%c[Polling] Success! Image generated.', 'color: green;');
            } else {
              throw new Error('Generation succeeded but the result URL is missing.');
            }
          } else if (statusData.status === 'Failed') { // <-- FIX: Check for 'Failed'
            stopPolling();
            setErrorMessage(statusData.details || 'Generation failed on the server.');
            setGenerationStatus('failed');
            console.error('[Polling] Generation failed:', statusData);
          }
          // Other statuses like 'Queued', 'Processing' will just continue polling
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
        // We need to check the status inside the interval as well
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
  }, [mainImage, settings.prompt, stopPolling]);

  // --- END: NEW ROBUST LOGIC ---
  
  const handleStartOver = () => {
    setCurrentStep(1);
    setMainImage(null);
    setElementFiles([]);
    setFinalImageUrl(null);
    setErrorMessage(null);
    setGenerationStatus('idle');
  };

  const renderContent = () => {
    if (generationStatus === 'completed' && finalImageUrl) {
      return (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white light:text-gray-900 mb-4">{t('project_created')}</h2>
          <div className="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg">
            <img src={finalImageUrl} alt="Generated Design" className="w-full h-full object-contain" />
          </div>
          <Button onClick={handleStartOver} className="mt-8">
            <Sparkles className="mr-2 h-4 w-4" />
            {t('generate_design')}
          </Button>
        </div>
      );
    }
    
    if (generationStatus === 'failed') {
        return (
            <div className="text-center text-gray-900 dark:text-white light:text-gray-900">
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 light:text-red-600 mb-4">{t('error_occurred')}</h2>
                <p className="text-gray-600 dark:text-gray-400 light:text-gray-700 mt-2">{errorMessage}</p>
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
            <div className="flex flex-col items-center justify-center h-96 text-gray-900 dark:text-white light:text-gray-900">
              <Loader2 className="w-16 h-16 animate-spin mb-4 text-purple-500 dark:text-purple-400 light:text-purple-600" />
              <h2 className="text-2xl font-bold">{t('generating')}</h2>
              <p className="text-gray-600 dark:text-gray-400 light:text-gray-700 mt-2">{t('loading')}</p>
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