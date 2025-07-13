'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Project } from '@/lib/types'
import { Loader2, Download, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  if (!params) {
    // Or display a more specific error message
    return <div>Loading...</div>; 
  }
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/projects?projectId=${projectId}`)
          if (response.ok) {
            const data = await response.json()
            setProject(data.project)
          } else {
            setProject(null)
          }
        } catch (error) {
          console.error('Failed to fetch project', error)
          setProject(null)
        } finally {
          setIsLoading(false)
        }
      }
      fetchProject()
    }
  }, [projectId])

  const handleDownloadPdf = async () => {
    if (!project) return;
    setIsDownloading(true);
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/ /g, '_')}_design.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-slate-500 dark:text-slate-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Loading Project Details...</h2>
          <p className="text-slate-600 dark:text-slate-400">Please wait while we fetch the project data.</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Project Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">The project you are looking for does not exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/" legacyBehavior>
            <a className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </a>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 overflow-hidden">
              <CardHeader>
                <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-24 h-24 text-slate-400 dark:text-slate-500" />
                    )}
                </div>
              </CardHeader>
            </Card>
          </div>
          
          <div>
            <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
                <CardContent className="p-6">
                    <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{project.description}</p>
                    <Button className="w-full" onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </>
                        )}
                    </Button>
                </CardContent>
            </Card>

             <Card className="mt-6 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Style & Concept</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {project.preferredStyles?.map(style => <Badge key={style} variant="secondary">{style}</Badge>)}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold">Budget</h4>
                            <p className="text-slate-600 dark:text-slate-400">{project.budget.min} - {project.budget.max} {project.budget.currency || 'RUB'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 