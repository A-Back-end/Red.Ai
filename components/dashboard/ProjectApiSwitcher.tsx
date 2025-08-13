import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, FileText, Wifi, WifiOff } from 'lucide-react';

interface ApiStatus {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  canWrite: boolean;
  storage: string;
  message?: string;
}

export function ProjectApiSwitcher() {
  const [fileApiStatus, setFileApiStatus] = useState<ApiStatus | null>(null);
  const [supabaseApiStatus, setSupabaseApiStatus] = useState<ApiStatus | null>(null);
  const [currentApi, setCurrentApi] = useState<'file' | 'supabase'>('file');
  const [testing, setTesting] = useState(false);

  // Test API endpoints
  const testEndpoint = async (endpoint: string): Promise<ApiStatus> => {
    try {
      // Test health if available
      if (endpoint === '/api/projects') {
        const healthResponse = await fetch('/api/health');
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          return {
            endpoint,
            status: healthData.status,
            canWrite: healthData.database?.writable || false,
            storage: 'file',
            message: healthData.database?.writable ? 'File system is writable' : 'Cannot write to database file'
          };
        }
      }

      // Test actual API
      const response = await fetch(`${endpoint}?userId=test`);
      const data = await response.json();
      
      if (response.ok) {
        return {
          endpoint,
          status: 'healthy',
          canWrite: true,
          storage: data.storage || (endpoint.includes('supabase') ? 'supabase' : 'file'),
          message: `API working with ${data.storage || 'unknown'} storage`
        };
      } else {
        return {
          endpoint,
          status: 'degraded',
          canWrite: false,
          storage: 'unknown',
          message: data.error || 'API error'
        };
      }
    } catch (error) {
      return {
        endpoint,
        status: 'unhealthy',
        canWrite: false,
        storage: 'unknown',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  };

  // Run tests
  const runTests = async () => {
    setTesting(true);
    try {
      const [fileStatus, supabaseStatus] = await Promise.all([
        testEndpoint('/api/projects'),
        testEndpoint('/api/projects-supabase')
      ]);
      
      setFileApiStatus(fileStatus);
      setSupabaseApiStatus(supabaseStatus);
      
      // Auto-select working API
      if (fileStatus.canWrite && fileStatus.status === 'healthy') {
        setCurrentApi('file');
      } else if (supabaseStatus.canWrite && supabaseStatus.status === 'healthy') {
        setCurrentApi('supabase');
      }
    } catch (error) {
      console.error('Failed to test APIs:', error);
    } finally {
      setTesting(false);
    }
  };

  // Test on mount
  useEffect(() => {
    runTests();
  }, []);

  // Switch API
  const switchApi = (api: 'file' | 'supabase') => {
    setCurrentApi(api);
    
    // Store preference
    localStorage.setItem('redai_api_preference', api);
    
    // Notify parent components about API change
    window.dispatchEvent(new CustomEvent('apiSwitched', { 
      detail: { 
        api, 
        endpoint: api === 'file' ? '/api/projects' : '/api/projects-supabase' 
      } 
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ApiStatus | null) => {
    if (!status) return <Wifi className="h-4 w-4 text-gray-400" />;
    
    return status.canWrite ? 
      <Wifi className="h-4 w-4 text-green-500" /> : 
      <WifiOff className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Project Storage API Status
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runTests}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File API Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <div>
              <div className="font-medium">File Storage API</div>
              <div className="text-sm text-gray-600">/api/projects</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(fileApiStatus)}
            
            <Badge 
              variant="outline" 
              className={`${fileApiStatus ? getStatusColor(fileApiStatus.status) : 'bg-gray-500'} text-white`}
            >
              {fileApiStatus?.status || 'unknown'}
            </Badge>
            
            {currentApi === 'file' && (
              <Badge variant="default">Active</Badge>
            )}
            
            {fileApiStatus?.canWrite && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => switchApi('file')}
                disabled={currentApi === 'file'}
              >
                Use This
              </Button>
            )}
          </div>
        </div>

        {fileApiStatus?.message && (
          <div className="text-sm text-gray-600 ml-8">
            {fileApiStatus.message}
          </div>
        )}

        {/* Supabase API Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5" />
            <div>
              <div className="font-medium">Supabase API</div>
              <div className="text-sm text-gray-600">/api/projects-supabase</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(supabaseApiStatus)}
            
            <Badge 
              variant="outline" 
              className={`${supabaseApiStatus ? getStatusColor(supabaseApiStatus.status) : 'bg-gray-500'} text-white`}
            >
              {supabaseApiStatus?.status || 'unknown'}
            </Badge>
            
            {currentApi === 'supabase' && (
              <Badge variant="default">Active</Badge>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => switchApi('supabase')}
              disabled={currentApi === 'supabase'}
            >
              Use This
            </Button>
          </div>
        </div>

        {supabaseApiStatus?.message && (
          <div className="text-sm text-gray-600 ml-8">
            {supabaseApiStatus.message}
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900">Recommendations:</div>
              <ul className="mt-1 text-blue-800 list-disc list-inside space-y-1">
                {fileApiStatus?.canWrite ? (
                  <li>File API is working - you can continue using it</li>
                ) : (
                  <li>File API has write issues - consider switching to Supabase</li>
                )}
                <li>Supabase API works without file permissions (recommended for production)</li>
                <li>Memory storage is temporary - data lost on restart</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Selection */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Currently using:</div>
          <div className="font-medium">
            {currentApi === 'file' ? 'File Storage API' : 'Supabase API'} 
            {currentApi === 'supabase' && supabaseApiStatus?.storage === 'memory' && (
              <span className="text-yellow-600"> (Memory Mode)</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for getting current API endpoint
export function useProjectApi() {
  const [currentApi, setCurrentApi] = useState<'file' | 'supabase'>('file');
  
  useEffect(() => {
    // Get preference from localStorage
    const saved = localStorage.getItem('redai_api_preference') as 'file' | 'supabase';
    if (saved) {
      setCurrentApi(saved);
    }
    
    // Listen for API switches
    const handleApiSwitch = (event: CustomEvent) => {
      setCurrentApi(event.detail.api);
    };
    
    window.addEventListener('apiSwitched', handleApiSwitch as EventListener);
    return () => window.removeEventListener('apiSwitched', handleApiSwitch as EventListener);
  }, []);
  
  const endpoint = currentApi === 'file' ? '/api/projects' : '/api/projects-supabase';
  
  return { currentApi, endpoint };
} 