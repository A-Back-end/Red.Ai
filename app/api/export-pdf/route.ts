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
                <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Review the shopping list for required items.</li>
                  <li>Purchase furniture and decor from recommended retailers.</li>
                  <li>Follow layout suggestions for optimal placement.</li>
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
  </body>
  </html>
  `;
}
