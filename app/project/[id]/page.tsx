'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Project } from '@/lib/types'
import { Loader2, Download, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BeforeAfterSlider } from '@/components/ui/before-after-slider'
import Link from 'next/link'
import { CardDescription } from '@/components/ui/card'

// REMOVED fakeIkeaSuggestions

const fakeContractors = [
    { id: 'comp1', name: 'Строй-Мастер', specialty: 'Комплексный ремонт', rating: 4.8 },
    { id: 'comp2', name: 'Уют-Дом', specialty: 'Отделочные работы', rating: 4.9 },
    { id: 'comp3', name: 'Профи-Ремонт', specialty: 'Дизайнерский ремонт', rating: 4.7 },
];


export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params?.id as string | undefined
  
  // Все хуки должны быть на верхнем уровне, до любых условных возвратов
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false);
  
  // AI Furniture state
  const [ikeaSuggestions, setIkeaSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  const [contractors, setContractors] = useState(fakeContractors);

  // Обертываем fetchAiSuggestions в useCallback для стабильности ссылки
  const fetchAiSuggestions = useCallback(async (imageUrl: string) => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai-furniture-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      if (response.ok) {
        const data = await response.json();
        setIkeaSuggestions(data.furniture);
      } else {
        const errorData = await response.json();
        setAiError(errorData.details || 'Failed to fetch AI suggestions.');
      }
    } catch (error) {
      setAiError('An unexpected error occurred.');
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    const fetchProject = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/projects?projectId=${projectId}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data.project)
          // Once project is fetched, trigger AI furniture finder
          if (data.project?.imageUrl) {
            fetchAiSuggestions(data.project.imageUrl);
          } else {
            setIsAiLoading(false);
            setAiError("No image available for AI analysis.");
          }
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
  }, [projectId, fetchAiSuggestions])

  // Условный return после всех хуков
  if (!params) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-slate-500 dark:text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

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
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 overflow-hidden">
              <CardHeader>
                {/* Before/After Comparison или обычное изображение */}
                {project.originalImageUrl && project.imageUrl ? (
                  <BeforeAfterSlider
                    beforeImage={project.originalImageUrl}
                    afterImage={project.imageUrl}
                    beforeLabel="Original"
                    afterLabel="AI Design"
                    className="aspect-[16/9]"
                  />
                ) : project.imageUrl ? (
                  <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative rounded-lg overflow-hidden">
                    <Image 
                      src={project.imageUrl} 
                      alt={project.name || 'Project image'} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-700 flex items-center justify-center rounded-lg">
                    <ImageIcon className="w-24 h-24 text-slate-400 dark:text-slate-500" />
                  </div>
                )}
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

        {/* Next Steps Section */}
        <div className="mt-8">
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Следующие шаги</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Подбор мебели от ИКЕА (AI)</h3>
                {isAiLoading && (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
                    <p className="ml-2 text-slate-500">AI анализирует ваш дизайн...</p>
                  </div>
                )}
                {aiError && (
                   <div className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p>Ошибка: {aiError}</p>
                   </div>
                )}
                {!isAiLoading && !aiError && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ikeaSuggestions.map(item => (
                      <a key={item.id} href={item.productUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                          <div className="relative w-full h-40">
                            <Image 
                              src={item.imageUrl || '/img/img-1.jpg'} 
                              alt={item.name || 'Furniture item'} 
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-sm capitalize truncate">{item.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.price}</p>
                          </CardContent>
                        </Card>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Компании для реализации проекта</h3>
                 <div className="space-y-3">
                  {contractors.map(comp => (
                    <Card key={comp.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{comp.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{comp.specialty}</p>
                      </div>
                      <Badge variant="secondary">★ {comp.rating}</Badge>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Как это сделать?</h3>
                 <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg prose prose-sm dark:prose-invert">
                  <p>Мы готовим для вас детальное руководство, которое поможет вам воплотить этот дизайн в жизнь. Оно будет включать:</p>
                  <ul>
                    <li>Выбор цветовой палитры и материалов.</li>
                    <li>Советы по расстановке мебели.</li>
                    <li>Рекомендации по освещению.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 