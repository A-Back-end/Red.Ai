import { NextRequest, NextResponse } from 'next/server';
import { Project, FurnitureItem } from '@/lib/types';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'projects.json');

async function getProjectFromAPI(projectId: string): Promise<Project | null> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const projects = JSON.parse(data);
    const project = projects.find((p: any) => p.id === projectId);
    if (!project) return null;

    return {
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    };
  } catch (error) {
    console.error('Error fetching project from JSON DB:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    let project = await getProjectFromAPI(projectId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const htmlContent = generateProjectHTML(project);

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${project.name.replace(/ /g, '_')}_design.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'PDF export failed', details: error.message },
      { status: 500 }
    );
  }
}

function generateProjectHTML(project: Project): string {
  const shoppingListItems: FurnitureItem[] = project.shoppingList || project.designRecommendation?.furnitureItems || [];
  const totalCost = shoppingListItems.reduce((sum: number, item: FurnitureItem) => sum + (item.price || 0), 0);
  const colorPalette = project.designRecommendation?.colorPalette || [];

  // Placeholder data - will be replaced with dynamic AI-generated data later
  const fakeIkeaSuggestions = [
    { id: 'ikea1', name: 'Диван-кровать GRÖNLID', price: '59,999 RUB', imageUrl: 'https://www.ikea.com/ru/ru/images/products/gronlid-divan-krovat-3-mestnyy-sporda-naturalnyy__0671498_pe716282_s5.jpg', productUrl: '#' },
    { id: 'ikea2', name: 'Стеллаж KALLAX', price: '7,499 RUB', imageUrl: 'https://www.ikea.com/ru/ru/images/products/kallax-stellazh-belyy__0806233_pe770031_s5.jpg', productUrl: '#' },
    { id: 'ikea3', name: 'Стол-трансформер NORDEN', price: '19,999 RUB', imageUrl: 'https://www.ikea.com/ru/ru/images/products/norden-stol-transformer-belyy__0737134_pe740884_s5.jpg', productUrl: '#' },
  ];

  const fakeContractors = [
    { id: 'comp1', name: 'Строй-Мастер', specialty: 'Комплексный ремонт', rating: 4.8, website: '#' },
    { id: 'comp2', name: 'Уют-Дом', specialty: 'Отделочные работы', rating: 4.9, website: '#' },
    { id: 'comp3', name: 'Профи-Ремонт', specialty: 'Дизайнерский ремонт', rating: 4.7, website: '#' },
  ];

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Report: ${project.name}</title>
      <script src="https://cdn.tailwindcss.com"></script>
    <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Lora:wght@400;600&display=swap');
          body {
              font-family: 'Montserrat', sans-serif;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
          }
          .magazine-page {
              width: 210mm;
              height: 297mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
          }
          h1, h2, h3 { font-family: 'Lora', serif; }
    </style>
  </head>
  <body class="text-gray-800">
    <div class="magazine-page p-12 bg-white">
      <!-- Header -->
      <header class="flex justify-between items-center border-b-2 border-gray-200 pb-4">
          <h1 class="text-4xl font-bold text-gray-900">${project.name}</h1>
          <div class="text-right">
              <p class="text-lg font-semibold text-purple-700">RED AI</p>
              <p class="text-sm text-gray-500">Interior Design Report</p>
      </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow grid grid-cols-3 gap-8 mt-8">
          <!-- Left Column -->
          <div class="col-span-2">
              <div class="w-full h-[240mm] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                  <img src="${project.imageUrl || 'https://via.placeholder.com/800x1200'}" alt="Main project image" class="w-full h-full object-cover">
        </div>
      </div>

          <!-- Right Column -->
          <div class="col-span-1 flex flex-col space-y-6">
              <div>
                  <h2 class="text-2xl font-semibold border-b border-gray-200 pb-2 mb-3">Concept</h2>
                  <p class="text-gray-600 text-sm leading-relaxed">${project.description}</p>
      </div>

              <div>
                  <h3 class="text-xl font-semibold mb-3">Key Parameters</h3>
                  <div class="text-sm space-y-2">
                    <div class="flex justify-between">
                      <span class="font-semibold text-gray-700">Style:</span>
                      <span class="text-purple-600">${project.preferredStyles?.join(', ') || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-semibold text-gray-700">Budget:</span>
                      <span>${project.budget.min} - ${project.budget.max} ${project.budget.currency}</span>
          </div>
        </div>
            </div>

              <div>
                  <h3 class="text-xl font-semibold mb-3">Color Palette</h3>
                  <div class="flex space-x-2">
                      ${colorPalette.map(color => `<div style="background-color: ${color};" class="w-10 h-10 rounded-full border-2 border-white shadow-md"></div>`).join('')}
                </div>
            </div>

              <div>
                <h3 class="text-xl font-semibold mb-3">Next Steps</h3>
                <ul class="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li><b>AI-помощник по мебели:</b> На следующей странице вы найдете список мебели из IKEA, подобранный нашим ИИ.</li>
                  <li><b>Как это сделать:</b> В этом разделе скоро появится пошаговое руководство по реализации проекта.</li>
                  <li><b>Найти строителей:</b> Мы добавим сюда список проверенных компаний, которые помогут вам с ремонтом.</li>
                  <li><b>Список покупок:</b> Полный список всех необходимых товаров находится на следующей странице.</li>
            </ul>
              </div>
          </div>
      </main>
        </div>

    <!-- Second Page for Shopping List -->
    <div class="magazine-page p-12 bg-white" style="page-break-before: always;">
        <header class="border-b-2 border-gray-200 pb-4 mb-8">
            <h2 class="text-3xl font-bold text-gray-900">Shopping List</h2>
        </header>
        <div class="flex-grow">
            <table class="w-full text-sm">
            <thead>
                    <tr class="border-b-2 border-gray-300">
                        <th class="text-left py-2 font-semibold">Item</th>
                        <th class="text-left py-2 font-semibold">Category</th>
                        <th class="text-right py-2 font-semibold">Price</th>
                        <th class="text-center py-2 font-semibold">Link</th>
              </tr>
            </thead>
            <tbody>
                    ${shoppingListItems.map((item: FurnitureItem) => `
                        <tr class="border-b border-gray-200">
                            <td class="py-3">${item.name}</td>
                            <td class="py-3 text-gray-600">${item.category}</td>
                            <td class="py-3 text-right font-semibold">${item.price?.toLocaleString() || 'N/A'} ${project.budget.currency}</td>
                            <td class="py-3 text-center"><a href="#" class="text-purple-600 hover:underline">View</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
            <div class="mt-8 text-right">
                <p class="text-xl font-bold">Total Estimated Cost: ${totalCost.toLocaleString()} ${project.budget.currency}</p>
            </div>
        </div>
        <footer class="text-center text-xs text-gray-500 pt-8 border-t border-gray-200 mt-auto">
            <p>Generated by RED AI | ${new Date().toLocaleDateString()}</p>
        </footer>
    </div>

    <!-- Third Page for AI IKEA Suggestions -->
    <div class="magazine-page p-12 bg-white" style="page-break-before: always;">
        <header class="border-b-2 border-gray-200 pb-4 mb-8">
            <h2 class="text-3xl font-bold text-gray-900">AI-Powered Furniture Suggestions (IKEA)</h2>
        </header>
        <div class="flex-grow grid grid-cols-2 gap-8">
            ${fakeIkeaSuggestions.map(item => `
              <div class="flex flex-col bg-gray-50 rounded-lg overflow-hidden shadow">
                <div class="h-48 bg-gray-200">
                  <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-cover"/>
                </div>
                <div class="p-4 flex flex-col flex-grow">
                  <h4 class="font-semibold text-lg">${item.name}</h4>
                  <p class="text-md text-gray-600 mt-1">${item.price}</p>
                  <a href="${item.productUrl}" class="mt-auto inline-block text-purple-600 font-semibold hover:underline text-sm pt-2">View on IKEA →</a>
                </div>
              </div>
            `).join('')}
        </div>
    </div>

    <!-- Fourth Page for Contractors -->
    <div class="magazine-page p-12 bg-white" style="page-break-before: always;">
        <header class="border-b-2 border-gray-200 pb-4 mb-8">
            <h2 class="text-3xl font-bold text-gray-900">Recommended Contractors</h2>
        </header>
        <div class="flex-grow space-y-4">
            ${fakeContractors.map(comp => `
              <div class="p-4 border border-gray-200 rounded-lg flex justify-between items-center shadow-sm">
                <div>
                  <h4 class="font-bold text-xl text-gray-800">${comp.name}</h4>
                  <p class="text-sm text-gray-500">${comp.specialty}</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-purple-700">★ ${comp.rating}</div>
                  <a href="${comp.website}" class="text-sm text-purple-600 hover:underline">Visit Website</a>
                </div>
              </div>
            `).join('')}
        </div>
    </div>
  </body>
  </html>
  `;
}
