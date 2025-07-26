#!/usr/bin/env node

/**
 * 🏠 Тестовый скрипт для Домовёнка с Azure OpenAI
 * Проверяет работу ИИ ассистента с новыми ключами
 */

const fs = require('fs');
const path = require('path');

console.log('🏠 === Тестирование Домовёнка с Azure OpenAI === 🏠\n');

// Проверка переменных окружения
function checkEnvironmentVariables() {
    console.log('📋 Проверка переменных окружения...\n');
    
    const envFile = path.join(process.cwd(), '.env.local');
    let envExists = fs.existsSync(envFile);
    
    console.log(`📁 .env.local файл: ${envExists ? '✅ Найден' : '❌ Не найден'}`);
    
    const requiredVars = [
        'AZURE_OPENAI_API_KEY',
        'AZURE_OPENAI_ENDPOINT',
        'AZURE_OPENAI_DEPLOYMENT_NAME'
    ];
    
    if (envExists) {
        const envContent = fs.readFileSync(envFile, 'utf8');
        
        requiredVars.forEach(varName => {
            const hasVar = envContent.includes(varName);
            const hasPlaceholder = envContent.includes(`${varName}=your_`) || 
                                 envContent.includes(`${varName}=https://your-`) ||
                                 envContent.includes(`${varName}=AZURE_`);
            
            if (hasVar && !hasPlaceholder) {
                console.log(`🔑 ${varName}: ✅ Настроена`);
            } else if (hasVar) {
                console.log(`🔑 ${varName}: ⚠️  Требует замены значения`);
            } else {
                console.log(`🔑 ${varName}: ❌ Отсутствует`);
            }
        });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
}

// Тестирование API endpoint
async function testDomovenokAPI() {
    console.log('🧪 Тестирование API домовенка...\n');
    
    const testMessages = [
        {
            role: 'user',
            content: 'Привет, Домовёнок! Расскажи о себе.'
        }
    ];
    
    const requestBody = {
        messages: testMessages,
        useAzure: true,
        assistantType: 'domovenok',
        data: {
            maxTokens: 1000,
            temperature: 0.7
        }
    };
    
    try {
        console.log('📤 Отправка запроса к API...');
        
        const response = await fetch('http://localhost:3000/api/azure-ai-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ API запрос успешен!\n');
            console.log('📊 Результат:');
            console.log(`🤖 Ассистент: ${result.assistant || 'Не указан'}`);
            console.log(`🔧 Провайдер: ${result.provider || 'Не указан'}`);
            console.log(`🧠 Модель: ${result.model || 'Не указана'}`);
            console.log(`💬 Ответ: ${result.message ? result.message.substring(0, 200) + '...' : 'Пустой'}`);
            
            if (result.usage) {
                console.log(`📈 Токены: ${result.usage.total_tokens || 'Не указано'}`);
            }
        } else {
            console.log('❌ Ошибка API запроса:\n');
            console.log(`🚨 Статус: ${response.status}`);
            console.log(`💬 Ошибка: ${result.error || 'Неизвестная ошибка'}`);
            console.log(`🔍 Детали: ${result.details || 'Нет деталей'}`);
        }
        
    } catch (error) {
        console.log('❌ Ошибка подключения к API:\n');
        console.log(`🚨 Ошибка: ${error.message}`);
        console.log('💡 Убедитесь, что сервер запущен: npm run dev');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
}

// Проверка конфигурации домовенка
function checkDomovenokConfig() {
    console.log('⚙️ Проверка конфигурации домовенка...\n');
    
    const configFile = path.join(process.cwd(), 'components/aiAssistant/DomovenokConfig.ts');
    const componentFile = path.join(process.cwd(), 'components/dashboard/DomovenokAIAssistant.tsx');
    
    console.log(`📄 DomovenokConfig.ts: ${fs.existsSync(configFile) ? '✅ Найден' : '❌ Не найден'}`);
    console.log(`📄 DomovenokAIAssistant.tsx: ${fs.existsSync(componentFile) ? '✅ Найден' : '❌ Не найден'}`);
    
    if (fs.existsSync(componentFile)) {
        const componentContent = fs.readFileSync(componentFile, 'utf8');
        const hasAssistantType = componentContent.includes('assistantType: \'domovenok\'');
        console.log(`🎯 assistantType настроен: ${hasAssistantType ? '✅ Да' : '❌ Нет'}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
}

// Генерация инструкций по настройке
function generateSetupInstructions() {
    console.log('📚 Инструкции по настройке:\n');
    
    console.log('1️⃣ Создайте файл .env.local в корне проекта');
    console.log('2️⃣ Добавьте следующие переменные:');
    console.log('');
    console.log('AZURE_OPENAI_API_KEY=your_actual_azure_api_key');
    console.log('AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/');
    console.log('AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4');
    console.log('AZURE_OPENAI_API_VERSION=2024-05-01-preview');
    console.log('');
    console.log('3️⃣ Замените на ваши реальные ключи от Azure');
    console.log('4️⃣ Убедитесь, что endpoint URL заканчивается на /');
    console.log('5️⃣ Перезапустите сервер: npm run dev');
    console.log('6️⃣ Протестируйте в браузере: http://localhost:3000/dashboard');
    console.log('');
    console.log('📖 Подробные инструкции в файле: DOMOVENOK_AZURE_SETUP.md');
    console.log('');
}

// Основная функция
async function main() {
    try {
        checkEnvironmentVariables();
        checkDomovenokConfig();
        
        // Проверяем, запущен ли сервер
        try {
            const healthCheck = await fetch('http://localhost:3000/api/check-status');
            if (healthCheck.ok) {
                await testDomovenokAPI();
            } else {
                console.log('⚠️  Сервер не отвечает. Запустите: npm run dev\n');
            }
        } catch {
            console.log('⚠️  Сервер не запущен. Запустите: npm run dev\n');
        }
        
        generateSetupInstructions();
        
        console.log('🎉 Тестирование завершено!');
        console.log('🏠 Домовёнок готов помочь вам с недвижимостью! ✨');
        
    } catch (error) {
        console.error('❌ Ошибка при тестировании:', error.message);
    }
}

// Запуск тестирования
main(); 