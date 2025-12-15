# Kia Qazaqstan - Панель управления лидами

Система управления лидами для Kia Qazaqstan с автоматическим обновлением данных каждую минуту.

## Возможности

- ✅ Авторизация пользователей
- ✅ API для приёма лидов из внешних платформ
- ✅ Автоматическое обновление дашборда каждую минуту
- ✅ Хранение данных в PostgreSQL
- ✅ Статистика по лидам в реальном времени
- ✅ Фильтрация по источникам трафика
- ✅ Оценка качества лидов

## Технологии

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **База данных:** PostgreSQL
- **ORM:** Drizzle ORM
- **Авторизация:** bcryptjs

## Установка и запуск

### 1. Предварительные требования

- Node.js 18+ 
- PostgreSQL 14+
- npm или pnpm

### 2. Настройка базы данных

Создайте базу данных в PostgreSQL:

```sql
CREATE DATABASE kia_db;
```

### 3. Установка зависимостей

```bash
npm install
```

### 4. Настройка переменных окружения

Файл `.env.local` уже создан со следующими настройками:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kia_db
```

Если у вас другие параметры подключения, измените их в файле `.env.local` или в `lib/db/index.ts`.

### 5. Создание таблиц в базе данных

```bash
npm run db:push
```

### 6. Создание пользователя (уже выполнено)

Пользователь admin уже создан. Если нужно создать дополнительного пользователя:

```bash
npx tsx scripts/create-user.ts
```

### 7. Запуск проекта

```bash
npm run dev
```

Откройте в браузере: http://localhost:3000 (или http://localhost:3001)

### 8. Вход в систему

- **Логин:** admin
- **Пароль:** admin123

## API для интеграции

### Добавление лида

**Endpoint:** `POST /api/leads`

**Пример запроса:**

```json
{
  "name": "Иван Иванов",
  "city": "Алматы",
  "selected_car": "Kia Sportage",
  "purchase_method": "кредит",
  "client_quality": 85,
  "traffic_source": "Instagram",
  "summary_dialog": "Клиент интересуется покупкой Kia Sportage в кредит."
}
```

**Поля:**
- `name` - Имя клиента (обязательно)
- `city` - Город (обязательно)
- `selected_car` - Выбранный автомобиль (обязательно)
- `purchase_method` - Способ покупки: наличные, кредит, trade-in (обязательно)
- `client_quality` - Качество лида 0-100 (обязательно)
- `traffic_source` - Источник: Instagram, WhatsApp, 2GIS (обязательно)
- `summary_dialog` - Резюме диалога (обязательно)

### Получение лидов

**Endpoint:** `GET /api/leads`

**Ответ:**
```json
{
  "leads": [...]
}
```

Подробная документация API: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Тестирование API

Смотрите файл [TEST_API.md](./TEST_API.md) для примеров тестовых запросов.

## Структура базы данных

### Таблица users
- id (serial, PK)
- username (varchar, unique)
- password (varchar, hashed)
- name (varchar)
- created_at (timestamp)

### Таблица leads
- id (serial, PK)
- name (varchar) - Имя клиента
- city (varchar) - Город
- selected_car (varchar) - Выбранный автомобиль
- purchase_method (varchar) - Способ покупки
- client_quality (integer) - Качество лида (0-100)
- traffic_source (varchar) - Источник трафика
- summary_dialog (text) - Резюме диалога
- created_at (timestamp) - Дата создания

## Команды npm

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для production
- `npm start` - Запуск production сервера
- `npm run db:push` - Применить схему к базе данных
- `npm run db:studio` - Открыть Drizzle Studio для управления БД

## Автоматическое обновление

Дашборд автоматически обновляет данные каждые 60 секунд без перезагрузки страницы.

## Удалённые компоненты

Из проекта удалены:
- Админ панель
- Управление пользователями
- Управление дашбордами
- Интеграция с Google Sheets

Проект переработан под одну компанию Kia Qazaqstan с фокусом на простоту и эффективность.

## Безопасность

- Пароли хешируются с помощью bcrypt
- Подключение к БД через защищённое соединение
- Валидация всех входящих данных через API

## Поддержка

При возникновении проблем проверьте:
1. Запущена ли PostgreSQL
2. Правильно ли настроены параметры подключения к БД
3. Применены ли миграции (`npm run db:push`)
4. Создан ли пользователь в БД

## Развёртывание на production

Для развёртывания на production сервере:

1. Установите PostgreSQL на сервере
2. Создайте базу данных kia_db
3. Обновите DATABASE_URL в переменных окружения
4. Запустите `npm run build`
5. Запустите `npm start`

Рекомендуется использовать:
- Vercel для хостинга Next.js приложения
- Supabase или Railway для PostgreSQL базы данных
