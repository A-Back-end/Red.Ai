# Google Authentication Setup Guide

Руководство по настройке Google авторизации для RED AI приложения.

## 🚀 Возможности

- ✅ Вход через Google (Firebase Auth)
- ✅ Валидация пароля (минимум 8 символов)
- ✅ Сохранен оригинальный дизайн приложения
- ✅ Поддержка русского и английского языков
- ✅ Автоматическое перенаправление после авторизации

## 📋 Предварительные требования

1. **Firebase проект** - https://console.firebase.google.com/
2. **Установленные зависимости**:
   ```bash
   npm install firebase react-hook-form @hookform/resolvers zod
   ```

## 🔧 Настройка Firebase

### Шаг 1: Создание Firebase проекта

1. Перейдите на https://console.firebase.google.com/
2. Нажмите "Add project" / "Добавить проект"
3. Введите название проекта (например, "red-ai-auth")
4. Включите Google Analytics (по желанию)
5. Создайте проект

### Шаг 2: Настройка Authentication

1. В Firebase Console откройте раздел "Authentication"
2. Перейдите на вкладку "Sign-in method"
3. Включите "Google" провайдер:
   - Нажмите на "Google"
   - Переключите в состояние "Enable"
   - Введите название проекта и email поддержки
   - Сохраните

### Шаг 3: Регистрация веб-приложения

1. В Firebase Console перейдите в "Project settings" (шестеренка)
2. Прокрутите до раздела "Your apps"
3. Нажмите "</>" (Web app)
4. Введите название приложения (например, "RED AI Web")
5. Включите "Firebase Hosting" (опционально)
6. Скопируйте конфигурацию Firebase

### Шаг 4: Настройка домена

1. В разделе "Authentication" → "Settings" → "Authorized domains"
2. Добавьте ваши домены:
   - `localhost` (для разработки)
   - Ваш production домен
   - `your-app.vercel.app` (если используете Vercel)

## ⚙️ Конфигурация Environment Variables

Создайте файл `.env.local` в корне проекта:

```bash
# === Firebase Configuration ===
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-42e5b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-42e5b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-42e5b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=369559140369
NEXT_PUBLIC_FIREBASE_APP_ID=1:369559140369:web:8a8e178e0353a0c67c99b0
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-BZN8ELJDMM
```

## 🎯 Использование

### Компоненты

1. **GoogleSignInButton** - Кнопка входа через Google
2. **Обновленная страница авторизации** с интегрированными возможностями

### Основные функции

```typescript
// lib/firebase.ts
import { signInWithGoogle, signOutFromFirebase, onAuthStateChanged } from '@/lib/firebase'

// Вход через Google
const { user, isNewUser } = await signInWithGoogle()

// Выход
await signOutFromFirebase()

// Слушать изменения состояния
onAuthStateChanged((user) => {
  if (user) {
    // Пользователь авторизован
  } else {
    // Пользователь не авторизован
  }
})
```

### Валидация пароля

- Минимум 8 символов
- Показывается ошибка в реальном времени при регистрации
- Стилизована в соответствии с дизайном приложения

## 🔒 Безопасность

### Firebase Security Rules

Настройте правила безопасности в Firebase Console:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и писать только свои данные
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🐛 Troubleshooting

### Распространенные ошибки

1. **Firebase: Unauthorized domain**
   - Добавьте домен в Authorized domains в Firebase Console

2. **Google Sign-In popup blocked**
   - Убедитесь, что popup не блокируется браузером
   - Используйте HTTPS в production

3. **Environment variables not loaded**
   - Перезапустите dev сервер после изменения .env файла
   - Убедитесь, что переменные начинаются с NEXT_PUBLIC_

### Отладка

Включите логирование для отладки:

```typescript
// lib/firebase.ts
import { getAuth } from 'firebase/auth'

const auth = getAuth()
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user?.email || 'No user')
})
```

## 📱 Mobile Support

Google Sign-In полностью поддерживает мобильные устройства:

- Адаптивный дизайн кнопок
- Поддержка touch событий
- Оптимизированные размеры для мобильных экранов

## 🚀 Deployment

### Vercel

1. Добавьте environment variables в Vercel Dashboard
2. Добавьте production домен в Firebase Authorized domains

### Другие платформы

Убедитесь, что:
- Environment variables настроены
- Домены добавлены в Firebase
- HTTPS используется в production

## 📚 Дополнительные ресурсы

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)

---

## 📞 Поддержка

Если у вас возникли проблемы с настройкой, проверьте:

1. Все ли environment variables установлены правильно
2. Добавлены ли домены в Firebase
3. Включен ли Google провайдер в Firebase Authentication
4. Работает ли интернет соединение для внешних API

Готово! 🎉 Теперь ваше приложение поддерживает современную Google авторизацию. 