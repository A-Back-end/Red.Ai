'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, Camera, Wand2, Sparkles, Image as ImageIcon, Loader2, X, Plus, Settings, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { useTranslations } from '@/lib/translations'

interface FluxDesignerProps {
  onAnalyze?: (data: any) => void
  onGenerate?: (data: any) => void
  onDesign?: (data: any) => void
  credits?: number
  canGenerate?: boolean
  onSpendCredits?: (amount?: number) => void
  onSetGenerating?: (generating: boolean) => void
}

// Stepper Component
const Stepper = ({ currentStep }: { currentStep: number }) => {
  const { t } = useTranslations()
  const steps = [
    { id: 1, title: t('uploadMainImage'), icon: Upload },
    { id: 2, title: t('add2DElements'), icon: Plus },
    { id: 3, title: t('generationSettings'), icon: Settings }
  ]

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = currentStep > step.id
        const Icon = step.icon

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isActive 
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-lg shadow-cyan-400/30' 
                  : isCompleted 
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-lg shadow-emerald-400/30'
                  : 'border-gray-600 bg-gray-800/50 text-gray-500'
              }`}>
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <p className={`mt-2 text-xs font-medium transition-all duration-300 ${
                isActive || isCompleted ? 'text-white' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${
                isCompleted ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-gray-700'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Step 1: Upload Main Image
const Step1Upload = ({ mainImage, setMainImage, nextStep }: any) => {
  const { t } = useTranslations()
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setMainImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
          <Upload className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t('uploadMainImage')}</h2>
        <p className="text-gray-400">{t('startByUploading')}</p>
      </div>

      <div
        className={`relative w-full h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-400/5 shadow-lg shadow-cyan-400/20'
            : 'border-gray-600 bg-gray-800/20 hover:border-gray-500 hover:bg-gray-800/30'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white font-medium">{t('clickToChange')}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center">
              <Upload className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">{t('dragDrop')}</p>
              <p className="text-gray-400 text-sm mt-1">или <span className="text-cyan-400 font-medium">{t('browseFiles')}</span></p>
              <p className="text-gray-500 text-xs mt-2">{t('supports')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={nextStep}
          disabled={!mainImage}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
        >
          Next Step <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Step 2: Add 2D Elements
const Step2Elements = ({ elements, setElements, nextStep, prevStep }: any) => {
  const { t } = useTranslations()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const updatedFiles = [...elements, ...newFiles]
      setElements(updatedFiles)
    }
      }

  const removeFile = (index: number) => {
    const updatedFiles = elements.filter((_: any, i: number) => i !== index)
    setElements(updatedFiles)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      const updatedFiles = [...elements, ...newFiles]
      setElements(updatedFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
      }

  const handleDragLeave = () => setIsDragging(false)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
          <Plus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t('add2DElements')}</h2>
        <p className="text-gray-400">{t('uploadAdditionalElements')}</p>
      </div>

      <div
        className={`relative w-full min-h-[20rem] border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                isDragging
            ? 'border-purple-400 bg-purple-400/5 shadow-lg shadow-purple-400/20'
            : 'border-gray-600 bg-gray-800/20 hover:border-gray-500 hover:bg-gray-800/30'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
          type="file"
                ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
                accept="image/*"
          multiple
              />
        {elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">{t('addFurniture')}</p>
              <p className="text-gray-400 text-sm mt-1">или <span className="text-purple-400 font-medium">{t('browseFiles')}</span></p>
              <p className="text-gray-500 text-xs mt-2">{t('multipleFiles')}</p>
                  </div>
                </div>
              ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {elements.map((file: File, index: number) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-700/50 rounded-lg overflow-hidden">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }} 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                >
                  <X size={14} className="text-white" />
                </button>
                <p className="text-xs text-gray-300 mt-2 truncate">{file.name}</p>
              </div>
            ))}
                </div>
              )}
            </div>

      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          variant="outline"
          className="bg-transparent border-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-3 px-8 rounded-xl"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={nextStep}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30"
        >
          Next Step <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Step 3: Generation Settings
const Step3Settings = ({ settings, setSettings, prevStep, onFinish, isGenerating, canGenerate = true, credits = 10 }: any) => {
  const { t } = useTranslations()

  const TemperatureButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold text-sm border-2 ${
        isActive 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' 
          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
      }`}
    >
      {label}
    </button>
  )

  const handleFinish = async () => {
    await onFinish?.(settings)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Generation Settings</h2>
        <p className="text-gray-400">Configure your AI-powered interior design generation</p>
      </div>

             <div className="space-y-6">
         {/* Prompt */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300 flex items-center">
            <Wand2 className="mr-2 h-4 w-4 text-purple-400" />
            Prompt <span className="text-red-400 text-xs ml-1">*</span>
          </label>
            <Textarea
            placeholder="Describe the design you want to generate..."
            value={settings.changes || ''}
            onChange={(e) => setSettings({...settings, changes: e.target.value})}
            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500">Main field for image generation. Be specific about style, colors, and elements.</p>
        </div>

         {/* Link Input */}
         <div className="space-y-3">
           <label className="text-sm font-medium text-gray-300 flex items-center">
             <Camera className="mr-2 h-4 w-4 text-emerald-400" />
             Link (optional)
           </label>
              <input
             type="url"
             placeholder="https://example.com/interior-design"
             className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
             value={settings.link || ''}
             onChange={(e) => setSettings({...settings, link: e.target.value})}
           />
         </div>

         {/* Design */}
         <div className="space-y-3">
           <label className="text-sm font-medium text-gray-300 flex items-center">
             <Sparkles className="mr-2 h-4 w-4 text-emerald-400" />
             Design
              </label>
           <div className="flex space-x-3">
             <TemperatureButton 
               label="3D" 
               isActive={settings.temperature === '3D'} 
               onClick={() => setSettings({...settings, temperature: '3D'})} 
             />
             <TemperatureButton 
               label="SketchUp" 
               isActive={settings.temperature === 'SketchUp'} 
               onClick={() => setSettings({...settings, temperature: 'SketchUp'})} 
             />
             <TemperatureButton 
               label="Rooming" 
               isActive={settings.temperature === 'Rooming'} 
               onClick={() => setSettings({...settings, temperature: 'Rooming'})} 
             />
            </div>
            </div>

        {/* Persona */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300 flex items-center">
            <Wand2 className="mr-2 h-4 w-4 text-purple-400" />
            Design <span className="text-purple-400 text-xs ml-1">NEW</span>
          </label>
          <Select value={settings.persona} onValueChange={(value) => setSettings({...settings, persona: value})}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500">
              <SelectValue placeholder="No Design" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="none">No Design</SelectItem>
              <SelectItem value="modern">Modern Design</SelectItem>
              <SelectItem value="classic">Classic Design</SelectItem>
              <SelectItem value="minimalist">Minimalist Design</SelectItem>
            </SelectContent>
          </Select>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Apartment Style */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Apartment Style</label>
            <Select value={settings.style} onValueChange={(value) => setSettings({...settings, style: value})}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="loft">Loft</SelectItem>
                <SelectItem value="scandinavian">Scandinavian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Room Type</label>
            <Select value={settings.roomType} onValueChange={(value) => setSettings({...settings, roomType: value})}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Select Room" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="living-room">Living Room</SelectItem>
                <SelectItem value="bedroom">Bedroom</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="bathroom">Bathroom</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Budget */}
          <div className="space-y-4">
          <label className="text-sm font-medium text-gray-300">Budget</label>
          <div className="space-y-3">
            <Slider
              value={[settings.budget]}
              onValueChange={([value]) => setSettings({...settings, budget: value})}
              max={50000}
              min={500}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>$500</span>
              <span className="text-purple-400 font-semibold">${settings.budget?.toLocaleString() || '5,000'}</span>
              <span>$50,000</span>
            </div>
          </div>
        </div>

      </div>

      <div className="flex flex-col items-center space-y-4">
            <Button
          onClick={handleFinish}
              disabled={isGenerating || !canGenerate}
          className={`w-full max-w-md font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg ${
            canGenerate && !isGenerating
              ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
            >
              {isGenerating ? (
                <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : !canGenerate ? (
                <>
              <X className="mr-2 h-5 w-5" />
              Insufficient Credits
                </>
              ) : (
                <>
              <Sparkles className="mr-2 h-5 w-5" />
              Finish & Generate
                </>
              )}
            </Button>
        <p className={`text-xs ${canGenerate ? 'text-gray-500' : 'text-red-500'}`}>
          {canGenerate ? `Uses 10 credits (${credits} available)` : 'Need 10 credits to generate'}
        </p>
          </div>

      <div className="flex justify-center">
        <Button
          onClick={prevStep}
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
              </div>
  )
}

export default function FluxDesigner({ onAnalyze, onGenerate, onDesign, credits = 10, canGenerate = true, onSpendCredits, onSetGenerating }: FluxDesignerProps) {
  const { t } = useTranslations()
  const [step, setStep] = useState(1)
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [elements, setElements] = useState<File[]>([])
  const [settings, setSettings] = useState({
    link: '',
    temperature: 'SketchUp',
    persona: 'none',
    style: 'modern',
    roomType: 'living-room',
    budget: 5000,
    changes: ''
  })
  const [generatedResult, setGeneratedResult] = useState<any>(null)
  type GenerationStatus = 'idle' | 'loading' | 'polling' | 'completed' | 'failed';
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [pollingUrl, setPollingUrl] = useState<string | null>(null);

  // Use a ref to hold the latest state and props to avoid stale closures in the polling interval.
  const latestStateRef = useRef({ settings, mainImage, elements, onDesign });
  useEffect(() => {
    latestStateRef.current = { settings, mainImage, elements, onDesign };
  });

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // This effect handles the polling lifecycle
  useEffect(() => {
    // Only run when in polling state and we have a URL
    if (generationStatus === 'polling' && pollingUrl) {
      const checkStatus = async () => {
        try {
          // Use mock data for status response (for limited tokens/testing)
            const statusResp = await fetch(`/api/check-status?url=${encodeURIComponent(pollingUrl)}`);
          if (!statusResp.ok) throw new Error('Network response was not ok during polling.');
          
          const statusData = await statusResp.json();

          if (statusData.status === 'Ready') {
            stopPolling();
            onSetGenerating?.(false);
            // Access the latest state via the ref to prevent stale data.
            const { settings, mainImage, elements, onDesign } = latestStateRef.current;
            setGeneratedResult({
              imageUrl: statusData.result.sample,
              metadata: {
                style: settings.style,
                roomType: settings.roomType,
                budget: settings.budget,
              },
            });
            setGenerationStatus('completed');
            onDesign?.({ mainImage, elements, settings, generatedImage: statusData.result.sample });
          } else if (statusData.status === 'Failed') {
            stopPolling();
            onSetGenerating?.(false);
            setErrorMessage(statusData.details || 'Generation failed on server.');
            setGenerationStatus('failed');
          }
          // If status is still 'Processing', 'Queued', etc., do nothing and let the interval run again.
        } catch (err: any) {
          console.error("Polling error:", err);
          stopPolling();
          onSetGenerating?.(false);
          setErrorMessage(err.message || 'An error occurred while checking the design status.');
          setGenerationStatus('failed');
        }
      };

      // Check immediately and then start the interval
      checkStatus();
      pollingRef.current = setInterval(checkStatus, 4000);
    }

    // Cleanup function for the effect
    return () => {
      stopPolling();
    };
  }, [generationStatus, pollingUrl]); // Stable dependencies prevent unnecessary re-runs.

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });
  };

  const handleFinish = async (finalSettings: any) => {
    if (!finalSettings.changes.trim()) {
      alert('Please enter a prompt to generate the design!');
      return;
    }

    // Check if user has enough credits
    if (!canGenerate) {
      alert('You don\'t have enough credits to generate a design. Need 10 credits.');
      return;
    }

    // Spend credits immediately when generation starts
    onSpendCredits?.(10);
    onSetGenerating?.(true);

    setSettings(finalSettings); // Important: Update settings before starting
    setGenerationStatus('loading');
    setErrorMessage(null);
    setGeneratedResult(null);
    setPollingUrl(null);
    stopPolling();

    try {
      let imageBase64: string | null = null;
      if (mainImage) {
        imageBase64 = await fileToBase64(mainImage);
      }

      // Подготавливаем все параметры для API
      const requestBody = {
        prompt: finalSettings.changes,
        imageBase64,
        style: finalSettings.style,
        roomType: finalSettings.roomType,
        temperature: finalSettings.temperature, // Тип дизайна (3D, SketchUp, Rooming)
        budget: finalSettings.budget,
        link: finalSettings.link,
      };

      console.log('Sending request to API with params:', requestBody);

      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.polling_url) {
        throw new Error(data.message || 'Failed to start generation.');
      }

      // Set the URL and status to trigger the useEffect for polling
      setPollingUrl(data.polling_url);
      setGenerationStatus('polling');

    } catch (err: any) {
      onSetGenerating?.(false);
      setErrorMessage(err.message);
      setGenerationStatus('failed');
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setMainImage(null);
    setElements([]);
    setGeneratedResult(null);
    setGenerationStatus('idle');
    setErrorMessage(null);
    setPollingUrl(null);
    stopPolling();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('designStudio')}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">{t('createStunning')}</p>
        </div>

        {/* Main Container */}
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-2xl shadow-slate-900/20 dark:shadow-black/20">
          <Stepper currentStep={step} />
          
          <div className="mt-8">
            {step === 1 && (
              <Step1Upload 
                mainImage={mainImage} 
                setMainImage={setMainImage} 
                nextStep={nextStep} 
              />
            )}
            {step === 2 && (
              <Step2Elements 
                elements={elements} 
                setElements={setElements} 
                nextStep={nextStep} 
                prevStep={prevStep} 
              />
            )}
            {step === 3 && (
              <Step3Settings 
                settings={settings} 
                setSettings={setSettings} 
                prevStep={prevStep} 
                onFinish={handleFinish}
                isGenerating={generationStatus === 'loading' || generationStatus === 'polling'}
                canGenerate={canGenerate}
                credits={credits}
              />
            )}
          </div>
        </div>
        
        {/* Generation Status & Result Panel */}
        {generationStatus !== 'idle' && (
          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
            {generationStatus === 'loading' && (
              <div className="flex flex-col items-center space-y-4 text-white text-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
                <p className="text-lg font-medium">Preparing your request...</p>
              </div>
            )}
            {generationStatus === 'polling' && (
              <div className="flex flex-col items-center space-y-4 text-white text-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
                <p className="text-lg font-medium">AI is working on your design...</p>
                <p className="text-sm text-gray-400">This may take up to a minute.</p>
              </div>
            )}
            {generationStatus === 'failed' && (
              <div className="text-center text-red-400">
                <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
                <p className="text-sm mb-4">{errorMessage}</p>
                <Button onClick={() => { setGenerationStatus('idle'); setGeneratedResult(null); stopPolling(); }}>
                  Try Again
                </Button>
              </div>
            )}
            {generationStatus === 'completed' && generatedResult && (
              <>
                <h3 className="text-2xl font-bold text-white mb-6 text-center">✨ Generated Design</h3>
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <img 
                    src={generatedResult.imageUrl} 
                    alt="Generated interior design" 
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                  />
                  <div className="mt-6 text-center text-gray-300 text-sm space-y-2">
                    <p><strong>Style:</strong> {generatedResult.metadata?.style}</p>
                    <p><strong>Room:</strong> {generatedResult.metadata?.roomType}</p>
                    <p><strong>Budget:</strong> ${generatedResult.metadata?.budget}</p>
                  </div>
                  <div className="mt-6 flex justify-center space-x-3">
                    <button 
                      onClick={() => window.open(generatedResult.imageUrl, '_blank')}
                      className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg"
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
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg"
                    >
                      Download
                    </button>
                    <button 
                      onClick={handleStartOver}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Generate New
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 