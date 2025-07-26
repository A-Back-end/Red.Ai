#!/usr/bin/env node

/**
 * Интерактивный просмотр данных Red.AI
 * Позволяет просматривать проекты, изображения, логи и конфигурацию
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

function logSection(title) {
  console.log('\n' + '-'.repeat(40));
  log(title, 'cyan');
  console.log('-'.repeat(40));
}

// Функции для просмотра данных

function viewProjects() {
  logSection('📊 ПРОЕКТЫ ПОЛЬЗОВАТЕЛЕЙ');
  
  const dbPath = path.join(process.cwd(), 'database', 'projects.json');
  
  if (!fs.existsSync(dbPath)) {
    log('❌ Файл projects.json не найден', 'red');
    return;
  }
  
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const projects = JSON.parse(data);
    
    log(`📈 Всего проектов: ${projects.length}`, 'green');
    
    // Статистика по статусам
    const statusStats = {};
    const userStats = {};
    
    projects.forEach(project => {
      statusStats[project.status] = (statusStats[project.status] || 0) + 1;
      userStats[project.userId] = (userStats[project.userId] || 0) + 1;
    });
    
    log('\n📊 Статистика по статусам:', 'yellow');
    Object.entries(statusStats).forEach(([status, count]) => {
      log(`  ${status}: ${count}`, 'white');
    });
    
    log('\n👥 Уникальных пользователей:', 'yellow');
    log(`  ${Object.keys(userStats).length}`, 'white');
    
    // Показать последние 5 проектов
    log('\n🕒 Последние 5 проектов:', 'yellow');
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    recentProjects.forEach((project, index) => {
      log(`\n${index + 1}. ${project.name}`, 'bright');
      log(`   ID: ${project.id}`, 'white');
      log(`   Пользователь: ${project.userId}`, 'white');
      log(`   Статус: ${project.status}`, 'white');
      log(`   Создан: ${new Date(project.createdAt).toLocaleString('ru-RU')}`, 'white');
      if (project.budget) {
        log(`   Бюджет: ${project.budget.min}-${project.budget.max} ${project.budget.currency}`, 'white');
      }
    });
    
  } catch (error) {
    log(`❌ Ошибка чтения проектов: ${error.message}`, 'red');
  }
}

function viewBackups() {
  logSection('💾 РЕЗЕРВНЫЕ КОПИИ');
  
  const dbDir = path.join(process.cwd(), 'database');
  
  if (!fs.existsSync(dbDir)) {
    log('❌ Директория database не найдена', 'red');
    return;
  }
  
  const files = fs.readdirSync(dbDir);
  const backupFiles = files.filter(file => file.startsWith('projects.json.backup.'));
  
  log(`📦 Найдено резервных копий: ${backupFiles.length}`, 'green');
  
  if (backupFiles.length > 0) {
    log('\n📋 Список резервных копий:', 'yellow');
    
    backupFiles
      .sort()
      .reverse()
      .slice(0, 10)
      .forEach((file, index) => {
        const filePath = path.join(dbDir, file);
        const stats = fs.statSync(filePath);
        const timestamp = file.replace('projects.json.backup.', '');
        const date = new Date(parseInt(timestamp));
        
        log(`\n${index + 1}. ${file}`, 'bright');
        log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB`, 'white');
        log(`   Дата: ${date.toLocaleString('ru-RU')}`, 'white');
      });
  }
}

function viewImages() {
  logSection('🖼️ ИЗОБРАЖЕНИЯ');
  
  const imageDirs = [
    { name: 'Загруженные изображения', path: 'public/uploads' },
    { name: 'Сгенерированные изображения', path: 'public/generated-images' },
    { name: 'Backend загрузки', path: 'backend/uploads' },
    { name: 'Backend сгенерированные', path: 'backend/generated-images' }
  ];
  
  imageDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir.path);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      
      log(`\n📁 ${dir.name}:`, 'yellow');
      log(`   Путь: ${dir.path}`, 'white');
      log(`   Файлов: ${imageFiles.length}`, 'white');
      
      if (imageFiles.length > 0) {
        const totalSize = imageFiles.reduce((sum, file) => {
          const filePath = path.join(fullPath, file);
          const stats = fs.statSync(filePath);
          return sum + stats.size;
        }, 0);
        
        log(`   Общий размер: ${(totalSize / 1024 / 1024).toFixed(2)} MB`, 'white');
        
        // Показать последние 3 файла
        const recentFiles = imageFiles
          .map(file => ({
            name: file,
            path: path.join(fullPath, file),
            time: fs.statSync(path.join(fullPath, file)).mtime
          }))
          .sort((a, b) => b.time - a.time)
          .slice(0, 3);
        
        log('   Последние файлы:', 'white');
        recentFiles.forEach(file => {
          const size = (fs.statSync(file.path).size / 1024).toFixed(2);
          log(`     ${file.name} (${size} KB)`, 'white');
        });
      }
    } else {
      log(`\n📁 ${dir.name}:`, 'yellow');
      log(`   ❌ Директория не существует: ${dir.path}`, 'red');
    }
  });
}

function viewLogs() {
  logSection('📝 ЛОГИ');
  
  const logFiles = [
    { name: 'Основной лог', path: 'logs/app.log' },
    { name: 'Backend лог', path: 'backend/logs/red_ai.log' }
  ];
  
  logFiles.forEach(logFile => {
    const fullPath = path.join(process.cwd(), logFile.path);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(2);
      
      log(`\n📄 ${logFile.name}:`, 'yellow');
      log(`   Путь: ${logFile.path}`, 'white');
      log(`   Размер: ${size} KB`, 'white');
      log(`   Последнее изменение: ${stats.mtime.toLocaleString('ru-RU')}`, 'white');
      
      // Показать последние 5 строк
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const lastLines = lines.slice(-5);
        
        if (lastLines.length > 0) {
          log('   Последние записи:', 'white');
          lastLines.forEach(line => {
            log(`     ${line}`, 'white');
          });
        }
      } catch (error) {
        log(`   ❌ Ошибка чтения: ${error.message}`, 'red');
      }
    } else {
      log(`\n📄 ${logFile.name}:`, 'yellow');
      log(`   ❌ Файл не найден: ${logFile.path}`, 'red');
    }
  });
}

function viewConfig() {
  logSection('⚙️ КОНФИГУРАЦИЯ');
  
  const configFiles = [
    { name: 'Next.js конфигурация', path: 'next.config.js' },
    { name: 'Tailwind конфигурация', path: 'tailwind.config.js' },
    { name: 'Prisma схема', path: 'prisma/schema.prisma' },
    { name: 'Backend конфигурация', path: 'backend/config.py' },
    { name: 'Docker Compose', path: 'docker-compose.yml' }
  ];
  
  configFiles.forEach(configFile => {
    const fullPath = path.join(process.cwd(), configFile.path);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(2);
      
      log(`\n📄 ${configFile.name}:`, 'yellow');
      log(`   Путь: ${configFile.path}`, 'white');
      log(`   Размер: ${size} KB`, 'white');
      log(`   Последнее изменение: ${stats.mtime.toLocaleString('ru-RU')}`, 'white');
    } else {
      log(`\n📄 ${configFile.name}:`, 'yellow');
      log(`   ❌ Файл не найден: ${configFile.path}`, 'red');
    }
  });
  
  // Проверить переменные окружения
  log('\n🔐 Переменные окружения:', 'yellow');
  const envVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'BFL_API_KEY',
    'AWS_S3_BUCKET_NAME'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      const maskedValue = value.length > 10 ? 
        value.substring(0, 10) + '...' : 
        value;
      log(`   ${varName}: ${maskedValue}`, 'green');
    } else {
      log(`   ${varName}: ❌ не установлена`, 'red');
    }
  });
}

function showMenu() {
  logHeader('🔍 ПРОСМОТР ДАННЫХ RED.AI');
  
  log('\nВыберите что хотите просмотреть:', 'bright');
  log('1. 📊 Проекты пользователей', 'white');
  log('2. 💾 Резервные копии', 'white');
  log('3. 🖼️ Изображения', 'white');
  log('4. 📝 Логи', 'white');
  log('5. ⚙️ Конфигурация', 'white');
  log('6. 🔄 Все данные', 'white');
  log('0. ❌ Выход', 'white');
  
  rl.question('\nВведите номер (0-6): ', (answer) => {
    switch (answer.trim()) {
      case '1':
        viewProjects();
        break;
      case '2':
        viewBackups();
        break;
      case '3':
        viewImages();
        break;
      case '4':
        viewLogs();
        break;
      case '5':
        viewConfig();
        break;
      case '6':
        viewProjects();
        viewBackups();
        viewImages();
        viewLogs();
        viewConfig();
        break;
      case '0':
        log('\n👋 До свидания!', 'green');
        rl.close();
        return;
      default:
        log('\n❌ Неверный выбор. Попробуйте снова.', 'red');
    }
    
    rl.question('\nНажмите Enter для продолжения...', () => {
      showMenu();
    });
  });
}

// Запуск приложения
if (require.main === module) {
  log('🚀 Запуск просмотрщика данных Red.AI...', 'green');
  showMenu();
}

module.exports = {
  viewProjects,
  viewBackups,
  viewImages,
  viewLogs,
  viewConfig
}; 