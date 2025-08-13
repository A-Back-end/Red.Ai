#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки сохранения изображений
 * Проверяет работу API endpoint /api/save-image
 */

const fs = require('fs');
const path = require('path');

// Тестовые URL изображений
const testImages = [
  'https://picsum.photos/400/300', // Случайное изображение
  'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Test+Image', // Placeholder
  'https://httpbin.org/image/png' // Простое PNG изображение
];

async function testImageSave(imageUrl, testName) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log(`📥 URL: ${imageUrl}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/save-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        filename: `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Success!');
      console.log(`   Local URL: ${result.localUrl}`);
      console.log(`   Filename: ${result.filename}`);
      console.log(`   Storage Type: ${result.storageType}`);
      console.log(`   File Size: ${result.fileSize} bytes`);
      
      // Проверяем, что файл действительно существует
      if (result.storageType === 'local') {
        const filePath = path.join(process.cwd(), 'public', result.localUrl);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          console.log(`   File exists: ${stats.size} bytes`);
        } else {
          console.log('   ⚠️  File does not exist on disk');
        }
      }
    } else {
      console.log('❌ Failed!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.error}`);
      console.log(`   Details: ${result.details}`);
    }
  } catch (error) {
    console.log('❌ Network Error!');
    console.log(`   Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Image Save Tests...');
  console.log('=' .repeat(50));
  
  // Проверяем, что сервер запущен
  try {
    const healthCheck = await fetch('http://localhost:3000/api/health');
    if (!healthCheck.ok) {
      console.log('❌ Server is not running on localhost:3000');
      console.log('   Please start the server with: npm run dev');
      return;
    }
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log('   Please start the server with: npm run dev');
    return;
  }
  
  // Проверяем папку для сохранения
  const saveDir = path.join(process.cwd(), 'public', 'generated-images');
  console.log(`📂 Save directory: ${saveDir}`);
  
  if (!fs.existsSync(saveDir)) {
    console.log('📁 Creating save directory...');
    fs.mkdirSync(saveDir, { recursive: true });
  }
  
  if (fs.existsSync(saveDir)) {
    console.log('✅ Save directory exists and is writable');
  } else {
    console.log('❌ Cannot create save directory');
    return;
  }
  
  // Запускаем тесты
  for (let i = 0; i < testImages.length; i++) {
    await testImageSave(testImages[i], `Test ${i + 1}`);
    // Небольшая пауза между тестами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Summary');
  console.log('=' .repeat(50));
  console.log('✅ Tests completed');
  console.log(`📁 Check saved images in: ${saveDir}`);
}

// Запускаем тесты
runTests().catch(console.error); 