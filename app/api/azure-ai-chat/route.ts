import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI, OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Azure OpenAI Client
const azureClient = process.env.AZURE_OPENAI_API_KEY ? new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-04-01-preview',
    baseURL: process.env.AZURE_OPENAI_ENDPOINT,
}) : null;

const azureDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-turbo';

// Standard OpenAI Client (as a fallback)
const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const openaiModel = 'gpt-4o';


export async function POST(req: NextRequest) {
    try {
        const { messages, data, useAzure } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Field 'messages' is required and must be an array." }, { status: 400 });
        }

        // Try Azure first, fallback to OpenAI
        let client = null;
        let model = '';
        let provider = '';
        
        if (useAzure && azureClient) {
            client = azureClient;
            model = azureDeploymentName;
            provider = 'Azure';
        } else if (openaiClient) {
            client = openaiClient;
            model = openaiModel;
            provider = 'OpenAI';
        }

        if (!client) {
            return NextResponse.json({ error: "No AI provider is configured. Please set either AZURE_OPENAI_API_KEY or OPENAI_API_KEY." }, { status: 500 });
        }

        const systemMessage: ChatCompletionMessageParam = {
            role: 'system',
            content: `You are Red.AI, a sophisticated AI assistant specializing in interior design, architecture, and real estate.
- Analyze user requests carefully.
- Provide detailed, professional, and actionable advice.
- When generating design ideas, focus on photorealism, lighting, and modern aesthetics.
- Maintain a helpful and expert tone.
- Your knowledge base includes information up to early 2024.`
        };

        try {
            const response = await client.chat.completions.create({
                model: model,
                messages: [systemMessage, ...messages.slice(-10)], // Use system prompt + last 10 messages
                max_tokens: data?.maxTokens || 1800,
                temperature: data?.temperature || 0.7,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stream: false,
            });

            const choice = response.choices[0];
            if (!choice || !choice.message?.content) {
                throw new Error("Failed to get a valid response from the AI model.");
            }

            return NextResponse.json({
                message: choice.message.content,
                usage: response.usage,
                provider: provider,
                model: model,
            });
        } catch (apiError: any) {
            console.error(`[${provider}] API Error:`, apiError);
            
            // If Azure fails and we haven't tried OpenAI yet, try OpenAI as fallback
            if (provider === 'Azure' && openaiClient) {
                console.log('Azure failed, trying OpenAI fallback...');
                try {
                    const fallbackResponse = await openaiClient.chat.completions.create({
                        model: openaiModel,
                        messages: [systemMessage, ...messages.slice(-10)],
                        max_tokens: data?.maxTokens || 1800,
                        temperature: data?.temperature || 0.7,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                        stream: false,
                    });

                    const fallbackChoice = fallbackResponse.choices[0];
                    if (fallbackChoice && fallbackChoice.message?.content) {
                        return NextResponse.json({
                            message: fallbackChoice.message.content,
                            usage: fallbackResponse.usage,
                            provider: 'OpenAI (Fallback)',
                            model: openaiModel,
                        });
                    }
                } catch (fallbackError: any) {
                    console.error('OpenAI fallback also failed:', fallbackError);
                }
            }
            
            throw apiError; // Re-throw original error if fallback fails
        }

    } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error in azure-ai-chat:`, error);
        
        const isAuthError = error.status === 401 || error.status === 403;
        const errorMessage = isAuthError 
            ? 'Authentication error. Please check your API key.' 
            : 'An internal server error occurred.';
            
        return NextResponse.json(
            { error: errorMessage, details: error.message },
            { status: isAuthError ? 401 : 500 }
        );
    }
} 