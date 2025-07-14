// tests/test_prompt_generator.ts
import { generateOptimizedPrompt, getBudgetContext } from '@/utils/promptGenerator';

/**
 * Тестирование генератора промптов для разных сценариев
 */

// Тест 1: Бюджет эконом-класса
console.log('=== ТЕСТ 1: ЭКОНОМ БЮДЖЕТ ($800) ===');
const economyTest = generateOptimizedPrompt({
  prompt: "Создайте уютную зону для чтения в углу комнаты",
  style: "modern",
  roomType: "living-room",
  temperature: "SketchUp",
  budget: 800,
});
console.log(economyTest);
console.log('\n');

// Тест 2: Средний класс
console.log('=== ТЕСТ 2: СРЕДНИЙ КЛАСС ($5,000) ===');
const middleClassTest = generateOptimizedPrompt({
  prompt: "Современная кухня с островом для семьи",
  style: "modern",
  roomType: "kitchen",
  temperature: "3D",
  budget: 5000,
});
console.log(middleClassTest);
console.log('\n');

// Тест 3: Премиум дизайн
console.log('=== ТЕСТ 3: ПРЕМИУМ ДИЗАЙН ($15,000) ===');
const premiumTest = generateOptimizedPrompt({
  prompt: "Роскошная спальня в классическом стиле",
  style: "classic",
  roomType: "bedroom",
  temperature: "3D",
  budget: 15000,
  link: "https://example.com/luxury-bedroom"
});
console.log(premiumTest);
console.log('\n');

// Тест 4: Люкс проект
console.log('=== ТЕСТ 4: ЛЮКС ПРОЕКТ ($50,000) ===');
const luxuryTest = generateOptimizedPrompt({
  prompt: "Домашний офис с библиотекой в стиле лофт",
  style: "loft",
  roomType: "office",
  temperature: "Rooming",
  budget: 50000,
});
console.log(luxuryTest);
console.log('\n');

// Тест 5: Минималистичный дизайн
console.log('=== ТЕСТ 5: МИНИМАЛИСТИЧНЫЙ ДИЗАЙН ($3,000) ===');
const minimalistTest = generateOptimizedPrompt({
  prompt: "Простая и функциональная ванная комната",
  style: "minimalist",
  roomType: "bathroom",
  temperature: "SketchUp",
  budget: 3000,
});
console.log(minimalistTest);
console.log('\n');

// Тест бюджетной логики
console.log('=== ТЕСТ БЮДЖЕТНОЙ ЛОГИКИ ===');
const budgetLevels = [500, 2000, 10000, 30000];
budgetLevels.forEach(budget => {
  const context = getBudgetContext(budget);
  console.log(`Бюджет $${budget}:`, context.description);
});

/**
 * Функция для запуска тестов
 */
export function runPromptGeneratorTests() {
  console.log('Запуск тестов генератора промптов...');
  
  // Здесь можно добавить дополнительные тесты
  const testCases = [
    {
      name: "Скандинавский стиль с низким бюджетом",
      params: {
        prompt: "Уютная гостиная в скандинавском стиле",
        style: "scandinavian",
        roomType: "living-room",
        temperature: "SketchUp",
        budget: 1500,
      }
    },
    {
      name: "Индустриальный лофт с высоким бюджетом",
      params: {
        prompt: "Просторная кухня в индустриальном стиле",
        style: "loft",
        roomType: "kitchen",
        temperature: "3D",
        budget: 25000,
      }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n=== ТЕСТ ${index + 6}: ${testCase.name.toUpperCase()} ===`);
    const result = generateOptimizedPrompt(testCase.params);
    console.log(result);
  });
}

// Запуск тестов, если файл вызывается напрямую
if (require.main === module) {
  runPromptGeneratorTests();
} 