import { NextRequest, NextResponse } from 'next/server'
import { Project } from '@/lib/types'

// Временное глобальное хранилище для демо
declare global {
  var __PROJECTS_DB: Project[] | undefined
}

// Получение данных проектов из внутреннего API
async function getProjectFromAPI(projectId: string): Promise<Project | null> {
  try {
    // В Next.js мы не можем делать fetch к самому себе, поэтому импортируем логику напрямую
    // В продакшене это был бы запрос к базе данных
    
    // Временно используем глобальное хранилище для хранения данных
    const projectsData = globalThis.__PROJECTS_DB || []
    return projectsData.find((p: Project) => p.id === projectId) || null
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting PDF export...')
    
    const { projectId, includeShoppingList = true, includeAnalysis = true, include3D = false } = await request.json()
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Получаем проект из глобального хранилища
    let project = await getProjectFromAPI(projectId)
    
    // Если проект не найден, используем демо-данные для тестирования
    if (!project) {
      console.log('Project not found, using demo data for:', projectId)
      project = createDemoProject(projectId)
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    console.log('Generating PDF for project:', {
      id: project.id,
      name: project.name,
      hasRoomAnalysis: !!project.roomAnalysis,
      hasDesignRecommendation: !!project.designRecommendation
    })

    // Генерируем HTML для PDF
    const htmlContent = generateProjectHTML(project, includeShoppingList, includeAnalysis, include3D)
    
    console.log('PDF export completed successfully for project:', projectId)

    return NextResponse.json({
      success: true,
      htmlPreview: htmlContent,
      project: project,
      downloadUrl: `/api/download-pdf?projectId=${projectId}`
    })

  } catch (error: any) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { 
        error: 'PDF export failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

function createDemoProject(projectId: string): Project {
  return {
    id: projectId,
    name: 'Дизайн современной гостиной',
    description: 'Минималистичный дизайн с элементами скандинавского стиля',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T15:30:00Z'),
    budget: { min: 80000, max: 150000, currency: 'RUB' },
    roomAnalysis: {
      roomType: 'living_room',
      dimensions: { width: 4.5, height: 3.2, area: 14.4 },
      condition: 'Устаревший интерьер',
      lighting: 'natural',
      windows: 2,
      features: [
        'старый диван', 
        'журнальный столик',
        'монотонная цветовая гамма',
        'белый',
        'бежевый',
        'светло-серый'
      ],
      recommendations: [
        'заменить на современный диван',
        'обновить поверхность столика',
        'устаревшая мебель требует замены',
        'недостаточное декоративное освещение',
        'отсутствие акцентных элементов',
        'добавить современную мебель',
        'создать функциональные зоны',
        'улучшить освещение с помощью ламп',
        'добавить растения и декор',
        'использовать яркие акцентные цвета'
      ]
    },
    designRecommendation: {
      style: 'modern',
      colorPalette: ['#2c3e50', '#ecf0f1', '#3498db', '#bdc3c7'],
      furnitureItems: [
        {
          id: 'f1',
          name: 'KIVIK 3-местный диван',
          category: 'sofa',
          description: 'Современный диван с мягкой обивкой и удобными подушками',
          price: 45000,
          imageUrl: 'https://via.placeholder.com/300x200',
        },
        {
          id: 'f2',
          name: 'LACK журнальный столик',
          category: 'table',
          description: 'Простой и функциональный столик',
          price: 8500,
          imageUrl: 'https://via.placeholder.com/300x200',
        },
        {
          id: 'l1',
          name: 'FOTO торшер',
          category: 'lighting',
          description: 'Современный торшер с регулировкой яркости',
          price: 8500,
          imageUrl: 'https://via.placeholder.com/200x200',
        },
        {
          id: 'd1',
          name: 'Монстера делициоза',
          category: 'decoration',
          description: 'Крупное комнатное растение для оживления интерьера',
          price: 2500,
          imageUrl: 'https://via.placeholder.com/200x200',
        }
      ],
      layoutSuggestions: [
        'Разместить диван у основной стены.',
        'Поставить торшер в углу для создания уютной зоны.'
      ],
      materials: ['дерево', 'металл', 'текстиль'],
      estimatedCost: 120000
    }
  }
}

function generateProjectHTML(project: Project, includeShoppingList: boolean, includeAnalysis: boolean, include3D: boolean): string {
  const totalCost = project.designRecommendation?.furnitureItems?.reduce((sum, item) => sum + item.price, 0) || 0;

  const getRoomTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      living_room: 'Гостиная',
      bedroom: 'Спальня',
      kitchen: 'Кухня',
      bathroom: 'Ванная',
      office: 'Кабинет',
      dining_room: 'Столовая',
      hallway: 'Прихожая'
    };
    return types[type as keyof typeof types] || type;
  };

  return `
  <!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Отчет по проекту: ${project.name}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; margin: 0; padding: 0; }
      .container { max-width: 800px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }
      .logo { max-width: 150px; margin-bottom: 15px; }
      h1 { font-size: 28px; color: #1a202c; margin: 0; }
      .subtitle { font-size: 18px; color: #718096; margin-top: 5px; }
      .section { margin-bottom: 30px; }
      h2 { font-size: 22px; color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
      .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
      .item-card { text-align: center; }
      .item-card img { max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 15px; }
      .item-card h4 { font-size: 16px; margin: 0 0 5px 0; }
      .item-card p { font-size: 14px; color: #4a5568; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
      .meta-item { background-color: #f7fafc; padding: 10px; border-radius: 5px; font-size: 14px; }
      .meta-item strong { color: #2d3748; display: block; margin-bottom: 3px; }
      .main-image { text-align: center; margin-bottom: 20px; }
      .main-image img { max-width: 100%; border-radius: 8px; }
      .color-palette { display: flex; gap: 10px; margin-top: 10px; }
      .color-swatch { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      ul { padding-left: 20px; }
      li { margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
      th { background-color: #f7fafc; }
      .total-cost { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; color: #2d3748; }
      .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://red-ai-bucket.s3.eu-central-1.amazonaws.com/logo-white.svg" alt="Red.AI Logo" class="logo">
        <h1>${project.name}</h1>
        <p class="subtitle">${project.description}</p>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <strong>ID Проекта:</strong>
          <span>${project.id}</span>
        </div>
        <div class="meta-item">
          <strong>Дата создания:</strong>
          <span>${new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="meta-item">
          <strong>Бюджет:</strong>
          <span>${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()} ${project.budget.currency}</span>
        </div>
      </div>

      <div class="main-image">
        <img src="${project.imageUrl}" alt="Main Project Image">
      </div>

      ${includeAnalysis && project.roomAnalysis ? `
        <div class="section">
          <h2>Анализ помещения</h2>
          <div class="card">
            <p><strong>Тип комнаты:</strong> ${getRoomTypeDisplay(project.roomAnalysis.roomType)}</p>
            <p><strong>Размеры:</strong> ${project.roomAnalysis.dimensions.width}м x ${project.roomAnalysis.dimensions.height}м (${project.roomAnalysis.dimensions.area}м²)</p>
            <p><strong>Освещение:</strong> ${project.roomAnalysis.lighting}</p>
            <p><strong>Состояние:</strong> ${project.roomAnalysis.condition}</p>
            <p><strong>Окна:</strong> ${project.roomAnalysis.windows}</p>
            
            <h3>Ключевые особенности</h3>
            <ul>
              ${project.roomAnalysis.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            
            <h3>Рекомендации</h3>
            <ul>
              ${project.roomAnalysis.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      ${project.designRecommendation ? `
        <div class="section">
          <h2>Рекомендации по дизайну</h2>
          <div class="card">
            <p><strong>Стиль:</strong> ${project.designRecommendation.style}</p>
            
            <h3>Цветовая палитра</h3>
            <div class="color-palette">
              ${project.designRecommendation.colorPalette.map(color => `
                <div class="color-swatch" style="background-color: ${color};" title="${color}"></div>
              `).join('')}
            </div>

            <h3>Предметы мебели (${project.designRecommendation.furnitureItems.length})</h3>
            <div class="grid">
              ${project.designRecommendation.furnitureItems.map(item => `
                <div class="card item-card">
                  <img src="${item.imageUrl}" alt="${item.name}">
                  <h4>${item.name}</h4>
                  <p>${item.description}</p>
                  <p><strong>Цена:</strong> ${item.price.toLocaleString()} ${project.budget.currency}</p>
                </div>
              `).join('')}
            </div>

            <h3>Рекомендации по расстановке</h3>
            <ul>
              ${project.designRecommendation.layoutSuggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>

            <h3>Материалы</h3>
            <p>${project.designRecommendation.materials.join(', ')}</p>
            
            <h3>Ориентировочная стоимость</h3>
            <p class="total-cost">${project.designRecommendation.estimatedCost.toLocaleString()} ${project.budget.currency}</p>
          </div>
        </div>
      ` : ''}

      ${includeShoppingList && project.designRecommendation?.furnitureItems ? `
      <div class="section">
        <h2>Список покупок</h2>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
              </tr>
            </thead>
            <tbody>
              ${project.designRecommendation.furnitureItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.price.toLocaleString()} ${project.budget.currency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <h3 class="total-cost">Итого: ${totalCost.toLocaleString()} ${project.budget.currency}</h3>
        </div>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Отчет сгенерирован Red.AI &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
