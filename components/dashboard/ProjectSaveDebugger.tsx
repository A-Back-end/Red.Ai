'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useUser } from '@clerk/nextjs';

interface ProjectSaveDebuggerProps {
  onTestSave: () => void;
}

export const ProjectSaveDebugger: React.FC<ProjectSaveDebuggerProps> = ({ onTestSave }) => {
  const { user, isLoaded } = useUser();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runDiagnostics = async () => {
    setIsTesting(true);
    const info: any = {};

    // Check user authentication
    info.user = {
      isLoaded,
      isSignedIn: !!user,
      userId: user?.id,
      email: user?.emailAddresses?.[0]?.emailAddress,
    };

    // Test API connectivity
    try {
      const response = await fetch('/api/projects?userId=test');
      info.apiTest = {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      };
    } catch (error) {
      info.apiTest = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test project creation
    try {
      const testProject = {
        name: 'Debug Test Project',
        userId: user?.id || 'debug_user',
        description: 'Test project for debugging',
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProject),
      });

      const result = await response.json();
      info.saveTest = {
        status: response.status,
        ok: response.ok,
        result,
      };
    } catch (error) {
      info.saveTest = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Check environment
    info.environment = {
      nodeEnv: process.env.NODE_ENV,
      hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      clerkKeyType: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('pk_live_') ? 'live' : 'test',
    };

    setDebugInfo(info);
    setIsTesting(false);
  };

  const clearDebugInfo = () => {
    setDebugInfo(null);
  };

  if (!debugInfo) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🔧 Project Save Debugger</span>
            <Badge variant="outline">Debug</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Run diagnostics to identify issues with project saving
          </p>
          <div className="flex space-x-2">
            <Button onClick={runDiagnostics} disabled={isTesting}>
              {isTesting ? 'Running...' : 'Run Diagnostics'}
            </Button>
            <Button onClick={onTestSave} variant="outline">
              Test Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔧 Debug Results</span>
          <Button onClick={clearDebugInfo} size="sm" variant="outline">
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* User Authentication */}
          <div>
            <h4 className="font-semibold mb-2">User Authentication</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span>Loaded:</span>
                <Badge variant={debugInfo.user.isLoaded ? "default" : "destructive"}>
                  {debugInfo.user.isLoaded ? "Yes" : "No"}
                </Badge>
                <span>Signed In:</span>
                <Badge variant={debugInfo.user.isSignedIn ? "default" : "destructive"}>
                  {debugInfo.user.isSignedIn ? "Yes" : "No"}
                </Badge>
                <span>User ID:</span>
                <span className="font-mono text-xs">{debugInfo.user.userId || "None"}</span>
                <span>Email:</span>
                <span className="font-mono text-xs">{debugInfo.user.email || "None"}</span>
              </div>
            </div>
          </div>

          {/* API Test */}
          <div>
            <h4 className="font-semibold mb-2">API Connectivity</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
              {debugInfo.apiTest.error ? (
                <div className="text-red-600">
                  <strong>Error:</strong> {debugInfo.apiTest.error}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <span>Status:</span>
                  <Badge variant={debugInfo.apiTest.ok ? "default" : "destructive"}>
                    {debugInfo.apiTest.status} {debugInfo.apiTest.statusText}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Save Test */}
          <div>
            <h4 className="font-semibold mb-2">Save Test</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
              {debugInfo.saveTest.error ? (
                <div className="text-red-600">
                  <strong>Error:</strong> {debugInfo.saveTest.error}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <span>Status:</span>
                    <Badge variant={debugInfo.saveTest.ok ? "default" : "destructive"}>
                      {debugInfo.saveTest.status}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <strong>Response:</strong>
                    <pre className="text-xs mt-1 bg-white dark:bg-gray-900 p-2 rounded overflow-auto">
                      {JSON.stringify(debugInfo.saveTest.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Environment */}
          <div>
            <h4 className="font-semibold mb-2">Environment</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span>Node Env:</span>
                <Badge variant="outline">{debugInfo.environment.nodeEnv}</Badge>
                <span>Clerk Key:</span>
                <Badge variant={debugInfo.environment.hasClerkKey ? "default" : "destructive"}>
                  {debugInfo.environment.hasClerkKey ? "Present" : "Missing"}
                </Badge>
                <span>Key Type:</span>
                <Badge variant="outline">{debugInfo.environment.clerkKeyType}</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSaveDebugger; 