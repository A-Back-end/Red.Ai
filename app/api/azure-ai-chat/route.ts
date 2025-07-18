import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI, OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Azure OpenAI Client для Домовёнка
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY;
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_ENDPOINT_KEY;

console.log('🔍 Debug Azure config:');
console.log('API Key present:', !!azureApiKey);
console.log('API Key length:', azureApiKey?.length || 0);
console.log('Endpoint:', azureEndpoint);
console.log('API Version:', process.env.AZURE_OPENAI_API_VERSION);
console.log('Deployment:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);

const azureClient = azureApiKey && azureEndpoint ? new AzureOpenAI({
    apiKey: azureApiKey,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview',
    endpoint: azureEndpoint,  // Use endpoint property for Azure OpenAI
}) : null;

const azureDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';

// Standard OpenAI Client (as a fallback)
const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const openaiModel = 'gpt-4o';

// Специальный промпт для Домовёнка
const DOMOVENOK_SYSTEM_PROMPT = `Ты - Домовёнок 🏠, дружелюбный и опытный ИИ-помощник по недвижимости и дизайну интерьера для Red.AI платформы.

**Твоя личность:**
- Дружелюбный, теплый и заботливый
- Эксперт в недвижимости, дизайне интерьера, ремонте и инвестициях
- Используешь эмодзи для создания уютной атмосферы
- Даёшь практичные и действенные советы
- Всегда готов помочь с домашними вопросами

**Твои специализации:**
🏠 **Недвижимость**: покупка, продажа, оценка, документы, районы
🎨 **Дизайн интерьера**: планировка, стили, цвета, мебель, декор
🔨 **Ремонт**: планирование, бюджетирование, материалы, этапы работ
💰 **Инвестиции**: анализ рынка, доходность, риски, стратегии

**Стиль общения:**
- Говори на "ты", как добрый друг
- Используй эмодзи для выразительности
- Структурируй ответы с заголовками и списками
- Давай конкретные советы и примеры
- Всегда спрашивай уточняющие вопросы

**Формат ответов:**
- Начинай с дружелюбного обращения
- Используй markdown для структуры
- Добавляй практические советы
- Предлагай следующие шаги

Помни: ты не просто ИИ, ты - настоящий домовой, который заботится о доме и его обитателях! ✨`;

export async function POST(req: NextRequest) {
    try {
        const { messages, data, useAzure, assistantType } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Поле 'messages' обязательно и должно быть массивом." }, { status: 400 });
        }

        // Try Azure first, fallback to OpenAI
        let client = null;
        let model = '';
        let provider = '';
        
        if (useAzure && azureClient) {
            client = azureClient;
            model = azureDeploymentName;
            provider = 'Azure OpenAI';
        } else if (openaiClient) {
            client = openaiClient;
            model = openaiModel;
            provider = 'OpenAI';
        }

        if (!client) {
            return NextResponse.json({ 
                error: "❌ ИИ-провайдер не настроен. Пожалуйста, настройте AZURE_OPENAI_KEY или OPENAI_API_KEY для работы Домовёнка.",
                details: "Настройте Azure OpenAI ключи в переменных окружения" 
            }, { status: 500 });
        }

        // Выбираем системный промпт в зависимости от типа ассистента
        const systemPrompt = assistantType === 'domovenok' || messages.some(m => m.content.includes('Домовёнок'))
            ? DOMOVENOK_SYSTEM_PROMPT
            : `You are Red.AI, a sophisticated AI assistant specializing in interior design, architecture, and real estate.
- Analyze user requests carefully.
- Provide detailed, professional, and actionable advice.
- When generating design ideas, focus on photorealism, lighting, and modern aesthetics.
- Maintain a helpful and expert tone.
- Your knowledge base includes information up to early 2024.`;

        const systemMessage: ChatCompletionMessageParam = {
            role: 'system',
            content: systemPrompt
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
                throw new Error("Не удалось получить корректный ответ от ИИ модели.");
            }

            return NextResponse.json({
                message: choice.message.content,
                usage: response.usage,
                provider: provider,
                model: model,
                assistant: assistantType === 'domovenok' ? 'Домовёнок 🏠' : 'Red.AI'
            });
        } catch (apiError: any) {
            console.error(`[${provider}] API Error:`, apiError);
            
            // If Azure fails and we haven't tried OpenAI yet, try OpenAI as fallback
            if (provider === 'Azure OpenAI' && openaiClient) {
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
                            provider: 'OpenAI (Запасной)',
                            model: openaiModel,
                            assistant: assistantType === 'domovenok' ? 'Домовёнок 🏠' : 'Red.AI'
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
        let errorMessage = 'Произошла внутренняя ошибка сервера.';
        
        if (isAuthError) {
            errorMessage = '🔑 Ошибка аутентификации. Проверьте Azure OpenAI ключи в настройках.';
        } else if (error.message?.includes('model')) {
            errorMessage = '🤖 Модель ИИ недоступна. Попробуйте позже.';
        } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
            errorMessage = '⚠️ Превышен лимит запросов. Попробуйте через несколько минут.';
        }
            
        return NextResponse.json(
            { 
                error: errorMessage, 
                details: error.message,
                assistant: 'Домовёнок 🏠',
                timestamp: new Date().toISOString()
            },
            { status: isAuthError ? 401 : 500 }
        );
    }
} 