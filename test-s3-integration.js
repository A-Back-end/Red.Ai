/**
 * Тестовый скрипт для проверки S3 интеграции
 * Запуск: node test-s3-integration.js
 */

const fetch = require('node-fetch')

const API_BASE_URL = 'http://localhost:3000'

// Тестовое изображение (небольшой временный URL)
const TEST_IMAGE_URL = 'https://delivery-eu1.bfl.ai/test-image.png'

async function testS3Integration() {
  console.log('🧪 Тестирование S3 интеграции...\n')

  try {
    // Тест 1: Проверка API endpoint /api/save-image
    console.log('1️⃣ Тестирование /api/save-image endpoint...')
    
    const saveResponse = await fetch(`${API_BASE_URL}/api/save-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: TEST_IMAGE_URL,
        filename: 'test-image.png'
      })
    })

    if (!saveResponse.ok) {
      throw new Error(`API returned ${saveResponse.status}: ${saveResponse.statusText}`)
    }

    const result = await saveResponse.json()
    console.log('✅ API Response:', result)

    if (result.success) {
      console.log(`📁 Storage Type: ${result.storageType}`)
      console.log(`🔗 Saved URL: ${result.localUrl}`)
      
      if (result.storageType === 's3') {
        console.log('✅ S3 интеграция работает!')
        console.log(`🗄️ S3 Key: ${result.s3Key}`)
      } else {
        console.log('⚠️ Используется локальное хранение (fallback)')
      }
    } else {
      console.log('❌ Ошибка сохранения:', result.error)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Тест 2: Проверка анализа проектов
    console.log('2️⃣ Тестирование /api/update-project-images endpoint...')
    
    const analysisResponse = await fetch(`${API_BASE_URL}/api/update-project-images`)
    
    if (!analysisResponse.ok) {
      throw new Error(`Analysis API returned ${analysisResponse.status}`)
    }

    const analysisResult = await analysisResponse.json()
    console.log('✅ Project Analysis:', analysisResult)

    console.log('\n' + '='.repeat(50) + '\n')

    // Тест 3: Проверка Environment переменных
    console.log('3️⃣ Проверка Environment переменных...')
    
    const requiredEnvVars = [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID', 
      'AWS_SECRET_ACCESS_KEY',
      'AWS_S3_BUCKET_NAME'
    ]

    const envStatus = requiredEnvVars.map(varName => ({
      name: varName,
      configured: !!process.env[varName]
    }))

    envStatus.forEach(env => {
      console.log(`${env.configured ? '✅' : '❌'} ${env.name}: ${env.configured ? 'Настроена' : 'НЕ НАСТРОЕНА'}`)
    })

    const allConfigured = envStatus.every(env => env.configured)
    
    if (allConfigured) {
      console.log('\n✅ Все AWS S3 переменные настроены!')
    } else {
      console.log('\n⚠️ Некоторые AWS S3 переменные не настроены. Будет использоваться локальное хранение.')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Результаты
    console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:')
    
    if (result.success && result.storageType === 's3') {
      console.log('🎉 AWS S3 интеграция работает корректно!')
      console.log('📸 Новые изображения будут сохраняться в S3')
      console.log('🔗 Никаких временных ссылок больше не будет')
    } else if (result.success && result.storageType === 'local') {
      console.log('⚠️ S3 не настроен, используется локальное хранение')
      console.log('💡 Настройте AWS S3 для продакшн среды')
    } else {
      console.log('❌ Проблемы с системой сохранения изображений')
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Убедитесь, что приложение запущено:')
      console.log('   npm run dev')
    }
  }
}

// Проверка конфигурации без запроса к API
function checkConfiguration() {
  console.log('🔧 Проверка локальной конфигурации...\n')
  
  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID', 
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME'
  ]

  console.log('Environment переменные:')
  requiredEnvVars.forEach(varName => {
    const isSet = !!process.env[varName]
    const value = isSet ? `${process.env[varName].substring(0, 10)}...` : 'НЕ УСТАНОВЛЕНА'
    console.log(`  ${isSet ? '✅' : '❌'} ${varName}: ${value}`)
  })

  const allSet = requiredEnvVars.every(varName => !!process.env[varName])
  
  console.log('\n' + '='.repeat(50))
  
  if (allSet) {
    console.log('✅ Все переменные настроены! Можно запускать полный тест.')
  } else {
    console.log('⚠️ Некоторые переменные не настроены.')
    console.log('\nДля настройки AWS S3:')
    console.log('1. Скопируйте env.production.example в .env.local')
    console.log('2. Заполните AWS переменные')
    console.log('3. Перезапустите приложение')
  }
}

// Запуск тестов
if (process.argv.includes('--config-only')) {
  checkConfiguration()
} else {
  testS3Integration()
}

console.log('\n📖 Для полной инструкции см. docs/AWS_S3_SETUP_GUIDE.md') 