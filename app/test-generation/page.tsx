'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestGenerationPage() {
  const [prompt, setPrompt] = useState('Modern living room with large windows');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingUrl, setPollingUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setStatus('starting');

    try {
      // Step 1: Start generation
      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style: 'modern',
          roomType: 'living-room',
          temperature: 'SketchUp',
          budget: 5000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start generation');
      }

      if (!data.polling_url) {
        throw new Error('No polling URL received');
      }

      setPollingUrl(data.polling_url);
      setStatus('polling');

      // Step 2: Poll for status
      let attempts = 0;
      const maxAttempts = 30; // 2 minutes max

      const pollStatus = async () => {
        attempts++;
        
        try {
          const statusResponse = await fetch(`/api/check-status?url=${encodeURIComponent(data.polling_url)}`);
          const statusData = await statusResponse.json();

          console.log(`[Test] Poll attempt ${attempts}:`, statusData.status);

          if (statusData.status === 'Ready') {
            setResult(statusData);
            setStatus('completed');
            setIsGenerating(false);
            return;
          } else if (statusData.status === 'Failed') {
            throw new Error(statusData.details || 'Generation failed');
          } else {
            // Still processing, continue polling
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, 4000); // Poll every 4 seconds
            } else {
              throw new Error('Generation timeout - took too long');
            }
          }
        } catch (pollError: any) {
          console.error('[Test] Polling error:', pollError);
          throw pollError;
        }
      };

      // Start polling after a short delay
      setTimeout(pollStatus, 2000);

    } catch (err: any) {
      console.error('[Test] Generation error:', err);
      setError(err.message);
      setStatus('failed');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Test Image Generation
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Test the image generation API and polling system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Prompt
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your design prompt..."
                className="w-full"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
          </CardContent>
        </Card>

        {status !== 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle>Status: {status}</CardTitle>
            </CardHeader>
            <CardContent>
              {pollingUrl && (
                <div className="mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Polling URL:</p>
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block break-all">
                    {pollingUrl}
                  </code>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 font-medium">Error:</p>
                  <p className="text-red-600 dark:text-red-300">{error}</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Generated Image:</p>
                    <img 
                      src={result.result.sample} 
                      alt="Generated design"
                      className="w-full max-w-md rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Result Details:</p>
                    <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 