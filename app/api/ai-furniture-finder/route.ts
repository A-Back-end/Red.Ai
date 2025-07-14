import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const azureClient = process.env.AZURE_OPENAI_API_KEY
  ? new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-04-01-preview',
      baseURL: process.env.AZURE_OPENAI_ENDPOINT,
    })
  : null;

const azureDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-vision-preview'; // Ensure you have a vision-capable model deployed

async function searchIkea(furnitureName: string): Promise<{ url: string, price: string, imageUrl: string } | null> {
    // This is a placeholder. In a real scenario, this would involve scraping or using an IKEA API.
    // For now, we'll simulate a search and return some dummy data.
    console.log(`Searching IKEA for: ${furnitureName}`);
    // In a real implementation, you would use a library like 'cheerio' or 'puppeteer'
    // to scrape IKEA's website, or a proper web search API.
    // For this example, let's assume we found something.
    try {
        // Here we would use a web search tool to find the product on IKEA's website
        // For example: `await webSearchTool.search("site:ikea.com/us/en/ " + furnitureName)`
        // Then parse the result to get the URL, price, and image.
        // Since I don't have a live web search tool, I will return a placeholder.
        return {
            url: `https://www.ikea.com/us/en/search/products/?q=${encodeURIComponent(furnitureName)}`,
            price: `${(Math.random() * 200 + 50).toFixed(2)} USD`,
            imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(furnitureName)}`
        };
    } catch (error) {
        console.error(`Failed to search IKEA for ${furnitureName}`, error);
        return null;
    }
}


export async function POST(req: NextRequest) {
    if (!azureClient) {
        return NextResponse.json({ error: "Azure OpenAI client is not configured." }, { status: 500 });
    }

    try {
        const { imageUrl } = await req.json();
        if (!imageUrl) {
            return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
        }

        const systemPrompt = `You are an expert interior designer. Analyze the provided image of a room. 
        Identify all significant furniture items. For each item, provide a short, descriptive name suitable for a web search (e.g., 'round wooden dining table', 'red velvet armchair').
        Return the output as a JSON array of strings. For example: ["red velvet armchair", "dark wood dining table", "crystal chandelier"].
        Only return the JSON array.`;

        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: imageUrl, detail: 'high' },
                    },
                ],
            },
        ];

        const response = await azureClient.chat.completions.create({
            model: azureDeploymentName,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.2,
            response_format: { type: "json_object" },
        });

        const rawResponse = response.choices[0]?.message?.content;
        if (!rawResponse) {
            throw new Error("Failed to get a valid response from the AI model.");
        }
        
        // It should return an object with a key that contains the array.
        // Let's assume the key is "furniture". e.g. {"furniture": ["item1", "item2"]}
        const furnitureList = JSON.parse(rawResponse).furniture || JSON.parse(rawResponse).items || JSON.parse(rawResponse);
        if (!Array.isArray(furnitureList)) {
             throw new Error("AI response was not a valid JSON array.");
        }


        // For now, we are skipping the IKEA search part as it's complex to implement live.
        // We will return mock data based on the furniture names.
        const furnitureDetails = furnitureList.map((name: string) => ({
             id: name.replace(/\s+/g, '-').toLowerCase(),
             name: name,
             price: `${(Math.random() * 300 + 50).toFixed(0)} RUB`,
             imageUrl: `https://source.unsplash.com/300x300/?${encodeURIComponent(name)}`,
             productUrl: `https://www.ikea.com/us/en/search/?q=${encodeURIComponent(name)}`
        }));


        return NextResponse.json({ furniture: furnitureDetails });

    } catch (error: any) {
        console.error('AI Furniture Finder Error:', error);
        return NextResponse.json({ error: 'Failed to analyze image and find furniture.', details: error.message }, { status: 500 });
    }
} 