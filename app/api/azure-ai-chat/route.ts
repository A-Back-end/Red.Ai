import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
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

        // Check if Azure is configured
        if (!azureClient) {
            return NextResponse.json({ 
                error: "❌ Azure OpenAI не настроен. Пожалуйста, настройте переменные окружения AZURE_OPENAI_API_KEY и AZURE_OPENAI_ENDPOINT.",
                details: "Azure OpenAI configuration missing or invalid",
                troubleshooting: {
                    "step1": "Создайте файл .env.local в корне проекта",
                    "step2": "Добавьте AZURE_OPENAI_API_KEY=ваш_ключ",
                    "step3": "Добавьте AZURE_OPENAI_ENDPOINT=ваш_endpoint", 
                    "step4": "Перезапустите сервер: npm run dev"
                }
            }, { status: 500 });
        }

        // Try to get available deployments from Azure
        const configuredDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const availableDeployments = [
            configuredDeployment, // Try configured deployment first
            'gpt-4.1',            // Known working deployment
            'gpt-4o',
            'gpt-4',
            'gpt-35-turbo', 
            'gpt-4-turbo',
            'gpt-4o-mini',
            'GPT-4',
            'GPT-35-TURBO',
            'gpt-4-32k',
            'gpt-35-turbo-16k'
        ].filter(Boolean); // Remove undefined values

        // Try Azure deployments
        let workingDeployment = null;
        let lastError = null;
        
                 for (const deployment of availableDeployments) {
             if (!deployment) continue; // Skip undefined/null values
             
             try {
                 console.log(`🔍 Trying Azure deployment: ${deployment}`);
                 // Quick test call to verify deployment exists with minimal tokens
                 await azureClient.chat.completions.create({
                     model: deployment,
                     messages: [{ role: 'user', content: 'Hi' }],
                     max_tokens: 1,
                 });
                
                // If we get here, deployment works
                workingDeployment = deployment;
                console.log(`✅ Found working Azure deployment: ${deployment}`);
                break;
            } catch (error: any) {
                lastError = error;
                console.log(`❌ Azure deployment ${deployment} failed:`, error.message);
                continue;
            }
        }

        if (!workingDeployment) {
            return NextResponse.json({ 
                error: "❌ Не найдено рабочих Azure deployments. Проверьте настройки в Azure Portal.",
                details: `Tried deployments: ${availableDeployments.join(', ')}`,
                lastError: lastError?.message,
                troubleshooting: {
                    "step1": "Откройте Azure Portal → Azure OpenAI",
                    "step2": "Перейдите в 'Model deployments'",
                    "step3": "Создайте deployment с именем 'gpt-4' или 'gpt-35-turbo'",
                    "step4": "Убедитесь, что deployment активен",
                    "step5": "Если deployment есть, проверьте имя в AZURE_OPENAI_DEPLOYMENT_NAME"
                }
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

        // Make the actual API call with the working deployment
        const response = await azureClient.chat.completions.create({
            model: workingDeployment,
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
            provider: 'Azure OpenAI',
            model: workingDeployment,
            workingDeployment: workingDeployment,
            assistant: assistantType === 'domovenok' ? 'Домовёнок 🏠' : 'Red.AI'
        });

    } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error in azure-ai-chat:`, error);
        
        const isAuthError = error.status === 401 || error.status === 403;
        const isQuotaError = error.status === 429 || error.message?.includes('quota') || error.message?.includes('limit');
        
        let errorMessage = 'Произошла внутренняя ошибка сервера.';
        let troubleshooting = {};
        
        if (isAuthError) {
            errorMessage = '🔑 Ошибка аутентификации Azure OpenAI. Проверьте API ключ.';
            troubleshooting = {
                "step1": "Проверьте AZURE_OPENAI_API_KEY в .env.local",
                "step2": "Убедитесь, что ключ активен в Azure Portal",
                "step3": "Проверьте правильность endpoint URL"
            };
        } else if (isQuotaError) {
            errorMessage = '⚠️ Превышен лимит запросов Azure OpenAI. Попробуйте через несколько минут.';
            troubleshooting = {
                "step1": "Подождите несколько минут",
                "step2": "Проверьте квоты в Azure Portal",
                "step3": "Увеличьте лимиты TPM в deployment"
            };
        } else if (error.message?.includes('model')) {
            errorMessage = '🤖 Модель ИИ недоступна. Проверьте deployment в Azure.';
            troubleshooting = {
                "step1": "Откройте Azure Portal → Model deployments",
                "step2": "Убедитесь, что deployment активен",
                "step3": "Проверьте имя модели в AZURE_OPENAI_DEPLOYMENT_NAME"
            };
        }
            
        return NextResponse.json(
            { 
                error: errorMessage, 
                details: error.message,
                troubleshooting: troubleshooting,
                assistant: 'Домовёнок 🏠',
                timestamp: new Date().toISOString()
            },
            { status: isAuthError ? 401 : 500 }
        );
    }
} 