'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Bot, Palette, Sofa, Coins, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface DesignSettings {
  prompt: string;
  inspirationWeight: string;
  design: string;
  apartmentStyle: string;
  roomType: string;
  budget: number;
}

type GenerationStatus = 'idle' | 'loading' | 'polling' | 'completed' | 'failed';

interface Step3SettingsProps {
  prevStep: () => void;
  settings: DesignSettings;
  setSettings: (settings: DesignSettings) => void;
  onGenerate: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  generationStatus: GenerationStatus;
  errorMessage?: string | null;
}

const TempButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg transition-all duration-300 font-semibold text-sm
      ${isActive ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
  >
    {label}
  </button>
);

export default function Step3Settings({ prevStep, settings, setSettings, onGenerate, generationStatus, errorMessage }: Step3SettingsProps) {
  
  useEffect(() => {
    const generateCombinedPrompt = () => {
      let combined = settings.prompt.split('##')[0].trim();
      const details = [];
      if (settings.design) details.push(`${settings.design}`);
      if (settings.apartmentStyle) details.push(`${settings.apartmentStyle} style`);
      if (settings.roomType) details.push(`${settings.roomType}`);
      
      if (details.length > 0) {
        combined += `\n\n## Details:\n- ${details.join('\n- ')}`;
      }
      return combined;
    };
    
    const newPrompt = generateCombinedPrompt();
    if (newPrompt !== settings.prompt) {
      // To avoid infinite loops, we can check if an update is needed.
      // This is a simple check; a more robust solution might be needed
      // if the user can also edit the prompt manually in complex ways.
      // For now, this prevents re-rendering cycles.
      // setSettings({ ...settings, prompt: newPrompt });
    }
  }, [settings.design, settings.apartmentStyle, settings.roomType, setSettings]);


  // This internal handler now matches what the parent's `onGenerate` expects
  const handleGenerateClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await onGenerate(event);
  };

  return (
    <div className="flex flex-col text-white">
      <h2 className="text-2xl font-bold text-center mb-8">Generation Settings</h2>
      
      <div className="space-y-6">
        {/* Prompt */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <label className="text-sm font-medium text-gray-300 flex items-center mb-3">
            <Sparkles size={16} className="text-purple-400 mr-2" />
            Prompt <span className="text-red-400 text-xs ml-1">*</span>
          </label>
          <Textarea
            placeholder="Describe the design you want to generate..."
            value={settings.prompt}
            onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
            className="w-full h-20 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 resize-none rounded-lg p-3"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-2">Main field for image generation. Be specific about style, colors, and elements. The fields below will be added to the prompt.</p>
        </div>

        {/* Temperature */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <label className="text-sm font-medium text-gray-300 flex items-center mb-3">
            <Sparkles size={16} className="text-purple-400 mr-2" />
            Inspiration Weight
          </label>
          <div className="flex space-x-2">
            <TempButton 
              label="Low" 
              isActive={settings.inspirationWeight === 'Low'} 
              onClick={() => setSettings({ ...settings, inspirationWeight: 'Low' })} 
            />
            <TempButton 
              label="Medium" 
              isActive={settings.inspirationWeight === 'Medium'} 
              onClick={() => setSettings({ ...settings, inspirationWeight: 'Medium' })} 
            />
            <TempButton 
              label="High" 
              isActive={settings.inspirationWeight === 'High'} 
              onClick={() => setSettings({ ...settings, inspirationWeight: 'High' })} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Design */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <label htmlFor="design" className="text-sm font-medium text-gray-300 flex items-center mb-2">
                    <Bot size={16} className="text-purple-400 mr-2" />
                    Design
                </label>
                <Select value={settings.design} onValueChange={(value) => setSettings({ ...settings, design: value })}>
                    <SelectTrigger id="design" className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select Design" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="professional">Professional Design</SelectItem>
                        <SelectItem value="friendly">Modern Design</SelectItem>
                        <SelectItem value="minimalist">Minimalist Design</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Apartment Style */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <label htmlFor="style" className="text-sm font-medium text-gray-300 flex items-center mb-2">
                    <Palette size={16} className="text-purple-400 mr-2" />
                    Apartment Style
                </label>
                <Select value={settings.apartmentStyle} onValueChange={(value) => setSettings({ ...settings, apartmentStyle: value })}>
                    <SelectTrigger id="style" className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select Style" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="loft">Loft</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Room Type */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <label htmlFor="room" className="text-sm font-medium text-gray-300 flex items-center mb-2">
                <Sofa size={16} className="text-purple-400 mr-2" />
                Room Type
            </label>
            <Select value={settings.roomType} onValueChange={(value) => setSettings({ ...settings, roomType: value })}>
                <SelectTrigger id="room" className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select Room Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="living-room">Living Room</SelectItem>
                    <SelectItem value="bedroom">Bedroom</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bathroom">Bathroom</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        {/* Budget */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <label className="text-sm font-medium text-gray-300 flex items-center mb-4">
                <Coins size={16} className="text-purple-400 mr-2" />
                Budget
            </label>
            <div className="flex items-center space-x-4">
                <Slider
                    min={500}
                    max={50000}
                    step={100}
                    value={[settings.budget]}
                    onValueChange={([value]) => setSettings({ ...settings, budget: value })}
                    className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-400 [&>a]:bg-white [&>a]:border-2 [&>a]:border-purple-400"
                />
                <span className="text-purple-300 font-semibold w-24 text-right">${settings.budget.toLocaleString()}</span>
            </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center mt-8">
        <Button
          type="button"
          onClick={handleGenerateClick}
          disabled={generationStatus !== 'idle' || !settings.prompt.trim()}
          className="w-full max-w-xs bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generationStatus === 'loading' ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Starting Generation...
            </>
          ) : generationStatus === 'polling' ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Generating Design...
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" />
              Finish & Generate
            </>
          )}
        </Button>
        {generationStatus === 'polling' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-purple-400">Processing your design...</p>
            <p className="text-xs text-gray-500 mt-1">This usually takes 15-30 seconds</p>
          </div>
        )}
        {generationStatus === 'loading' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-purple-400">Initializing generation...</p>
            <p className="text-xs text-gray-500 mt-1">Preparing your request</p>
          </div>
        )}
        {generationStatus === 'failed' && errorMessage && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-400">{errorMessage}</p>
            <p className="text-xs text-gray-500 mt-1">Please try again</p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Uses 10 credits</p>
      </div>

      <div className="mt-4 text-center">
        <Button
          onClick={prevStep}
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-gray-700"
          disabled={generationStatus !== 'idle'}
        >
          Back
        </Button>
      </div>
    </div>
  );
} 