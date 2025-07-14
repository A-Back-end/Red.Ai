'use client'

import { useState } from 'react'
import { BeforeAfterSlider } from '@/components/ui/before-after-slider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const showcaseProjects = [
  {
    id: 1,
    title: 'Modern Living Room Transformation',
    style: 'Modern',
    beforeImage: '/img/img-1.jpg',
    afterImage: '/generated-images/dalle3-modern-living-room-1752138482160.png',
    description: 'Complete redesign with contemporary furniture and clean lines'
  },
  {
    id: 2,
    title: 'Kitchen Renovation',
    style: 'Minimalist',
    beforeImage: '/img/img-3.jpg',
    afterImage: '/generated-images/dalle3-Modern-Living-Room-1752064495097.png',
    description: 'Sleek minimalist design with smart storage solutions'
  },
  {
    id: 3,
    title: 'Bedroom Makeover',
    style: 'Scandinavian',
    beforeImage: '/img/img-5.jpg',
    afterImage: '/generated-images/dalle3-modern-living-room-1752066300152.png',
    description: 'Cozy Scandinavian style with natural materials'
  }
]

export default function BeforeAfterShowcase() {
  const [activeProject, setActiveProject] = useState(0)

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            See the Magic in Action
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transform any space with AI-powered design. Drag the slider to see before and after comparisons
            of real projects designed by our AI.
          </p>
        </div>

        {/* Project Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {showcaseProjects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => setActiveProject(index)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeProject === index
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-700 shadow-md'
              }`}
            >
              {project.title}
            </button>
          ))}
        </div>

        {/* Main Showcase */}
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden shadow-2xl border-0 bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              {/* Before/After Slider */}
              <div className="aspect-[21/9] relative">
                <BeforeAfterSlider
                  beforeImage={showcaseProjects[activeProject].beforeImage}
                  afterImage={showcaseProjects[activeProject].afterImage}
                  beforeLabel="Before"
                  afterLabel="After"
                  className="aspect-[21/9]"
                />
              </div>

              {/* Project Info */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-700 dark:to-slate-600">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {showcaseProjects[activeProject].title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {showcaseProjects[activeProject].description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {showcaseProjects[activeProject].style}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-400">
                      AI Generated
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">10x</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Faster Design Process</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">95%</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Client Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">50%</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Cost Reduction</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Start Your Design Journey
          </button>
        </div>
      </div>
    </section>
  )
} 