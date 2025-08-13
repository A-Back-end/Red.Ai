# Руководство по настройке AWS S3 для постоянного хранения изображений

## Обзор

Это руководство поможет вам настроить Amazon S3 для постоянного хранения изображений вместо временных ссылок от AI-сервисов (DALL-E, BFL.ai и т.д.). 

**Проблема:** AI-сервисы возвращают временные ссылки на изображения, которые через некоторое время становятся недействительными (ошибка 404).

**Решение:** Автоматически скачивать изображения и загружать их в ваше постоянное облачное хранилище (AWS S3).

## Что было изменено

### ✅ Новые компоненты:
- **`lib/s3-service.ts`** - Сервис для работы с AWS S3
- **Обновлен `/api/save-image`** - Теперь загружает в S3 или локально как fallback
- **Обновлен `utils/imageUtils.ts`** - Использует новый API endpoint
- **Environment переменные** - Добавлена конфигурация для AWS S3

### ✅ Логика работы:
1. При генерации изображения система проверяет, является ли URL временным
2. Если да - скачивает изображение через `/api/save-image`
3. API пытается загрузить в S3, если настроен
4. Если S3 недоступен - сохраняет локально как fallback
5. В базу данных записывается постоянная ссылка (S3 или локальная)

## Пошаговая настройка AWS S3

### Шаг 1: Создание S3 Bucket

1. Войдите в [AWS Console](https://console.aws.amazon.com/)
2. Перейдите в **S3** сервис
3. Нажмите **"Create bucket"**
4. Настройки bucket:
   ```
   Bucket name: your-redai-images (должно быть уникальным)
   Region: us-east-1 (или ближайший к вам)
   Block Public Access: ❌ Отключить (чтобы изображения были публично доступны)
   Versioning: ✅ Включить (опционально)
   ```

### Шаг 2: Настройка публичного доступа

1. Откройте созданный bucket
2. Перейдите в **Permissions** → **Bucket Policy**
3. Добавьте следующую политику (замените `your-redai-images` на ваше имя bucket):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-redai-images/*"
        }
    ]
}
```

### Шаг 3: Создание IAM пользователя

1. Перейдите в **IAM** сервис
2. **Users** → **Create user**
3. Username: `redai-s3-uploader`
4. **Attach policies directly** → **Create policy**
5. Политика для пользователя:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-redai-images/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-redai-images"
        }
    ]
}
```

6. **Create access key** для этого пользователя
7. Сохраните **Access Key ID** и **Secret Access Key**

### Шаг 4: Настройка environment переменных

Добавьте следующие переменные в ваш `.env.local` файл:

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_S3_BUCKET_NAME=your-redai-images

# Опционально: кастомный домен или CloudFront
# AWS_S3_PUBLIC_URL=https://your-cloudfront-domain.cloudfront.net
```

### Шаг 5: Тестирование интеграции

1. Перезапустите ваше приложение:
   ```bash
   npm run dev
   ```

2. Проверьте логи при запуске - должно появиться сообщение:
   ```
   ☁️ AWS S3 configured successfully
   ```

3. Сгенерируйте новое изображение в Design Studio
4. В логах должны появиться сообщения:
   ```
   ☁️ Using AWS S3 for image storage...
   ✅ Image uploaded to S3 successfully: https://your-bucket.s3.us-east-1.amazonaws.com/generated-images/...
   ```

## Настройка CloudFront (рекомендуется для продакшн)

CloudFront - это CDN от AWS, который ускоряет доставку изображений и позволяет использовать кастомный домен.

### Создание CloudFront Distribution:

1. Перейдите в **CloudFront** сервис
2. **Create Distribution**
3. Настройки:
   ```
   Origin Domain: your-redai-images.s3.us-east-1.amazonaws.com
   Origin Path: /generated-images (опционально)
   Viewer Protocol Policy: Redirect HTTP to HTTPS
   Cache Policy: Caching Optimized
   ```

4. Скопируйте Distribution Domain Name (например: `d123456789.cloudfront.net`)
5. Добавьте в `.env.local`:
   ```bash
   AWS_S3_PUBLIC_URL=https://d123456789.cloudfront.net
   ```

## Миграция существующих проектов

Если у вас уже есть проекты с временными ссылками, используйте endpoint для их обновления:

```bash
# Анализ проектов с временными ссылками
curl http://localhost:3000/api/update-project-images

# Результат покажет сколько проектов нужно обновить
```

## Мониторинг и отладка

### Проверка статуса S3:
Добавьте в ваш код проверку конфигурации:
```typescript
import { getS3Service } from '@/lib/s3-service'

const s3Service = getS3Service()
if (s3Service && s3Service.isConfigured()) {
  console.log('✅ S3 configured')
} else {
  console.log('⚠️ S3 not configured, using local storage')
}
```

### Логи для отладки:
- `☁️ Using AWS S3 for image storage...` - S3 используется
- `📁 Using local storage as fallback...` - Fallback на локальное хранение
- `✅ Image uploaded to S3 successfully` - Успешная загрузка
- `⚠️ S3 upload failed, falling back to local storage` - Ошибка S3

## Альтернативные варианты

Если вы предпочитаете другие облачные хранилища, вы можете адаптировать код:

### Google Cloud Storage:
```bash
npm install @google-cloud/storage
```

### Azure Blob Storage:
```bash
npm install @azure/storage-blob
```

### Cloudinary:
```bash
npm install cloudinary
```

## Безопасность

### Рекомендации:
1. **Не комитьте** секретные ключи в git
2. **Используйте IAM роли** в продакшн вместо ключей (если деплоите на AWS)
3. **Настройте CORS** для S3 bucket если нужно
4. **Включите версионирование** S3 для защиты от случайного удаления
5. **Настройте lifecycle rules** для автоматического удаления старых файлов

## Стоимость

### Приблизительная стоимость AWS S3:
- **Хранение**: ~$0.023 за GB в месяц
- **Запросы**: ~$0.0004 за 1000 PUT запросов
- **Трафик**: Первые 100GB в месяц бесплатно

Для 1000 изображений (~2GB): **$0.05-0.10 в месяц**

## Поддержка

Если возникают проблемы:
1. Проверьте логи приложения
2. Убедитесь, что все environment переменные установлены
3. Проверьте права доступа IAM пользователя
4. Проверьте политику безопасности S3 bucket

## Что дальше

После успешной настройки S3:
1. ✅ Все новые изображения будут сохраняться постоянно
2. ✅ Никаких ошибок 404 через время
3. ✅ Быстрая загрузка через CloudFront
4. ✅ Масштабируемое решение для продакшн

Рекомендуется также настроить резервное копирование и мониторинг использования S3. 