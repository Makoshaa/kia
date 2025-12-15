# Инструкция по деплою на Render

## Что было исправлено

Проблема была в файле `lib/db/index.ts` - он использовал хардкод подключения к локальной БД вместо переменной окружения `DATABASE_URL`.

## Шаги для деплоя

### 1. Закоммитить изменения

```bash
git add .
git commit -m "Fix: Use DATABASE_URL for production deployment"
git push
```

### 2. Настроить переменные окружения в Render

В Dashboard вашего веб-сервиса на Render добавьте следующие переменные окружения:

- `DATABASE_URL` - Internal Database URL из настроек вашей БД PostgreSQL на Render
  - Формат: `postgresql://username:password@internal-host/database`
  - Найти можно в разделе вашей БД → Info → Internal Database URL

- `NODE_ENV=production`

- `API_KEY` - ваш API ключ (можете оставить `rLqgCPNcPN` или создать новый)

- `NEXT_PUBLIC_API_URL` - URL вашего приложения на Render
  - Формат: `https://kia-fgcs.onrender.com`

### 3. Задеплоить изменения

После коммита Render автоматически начнет новый деплой. Если нет:

1. Зайдите в Dashboard вашего веб-сервиса
2. Нажмите "Manual Deploy" → "Deploy latest commit"

### 4. После успешного деплоя - настроить БД

После того как деплой завершится успешно, нужно выполнить миграции и создать пользователя:

1. В Dashboard веб-сервиса на Render найдите раздел "Shell" или используйте SSH
2. Выполните команду:

```bash
npm run setup:production
```

Эта команда:
- Применит миграции к БД (создаст таблицы `users` и `leads`)
- Создаст пользователя `kia` с паролем `kia123`

### 5. Проверить работу

Откройте ваше приложение по адресу `https://kia-fgcs.onrender.com` и попробуйте войти:

- **Логин:** kia
- **Пароль:** kia123

## Troubleshooting

### Если получаете ошибку при setup:production

1. Проверьте логи БД в Render Dashboard
2. Убедитесь что DATABASE_URL правильно указан (должен быть Internal Database URL)
3. Проверьте что переменная окружения NODE_ENV=production установлена

### Если соединение с БД не устанавливается

1. В настройках БД на Render убедитесь что веб-сервис добавлен в allowed connections
2. Проверьте что используете Internal Database URL, а не External
3. Перезапустите веб-сервис

## Структура БД

После миграции будут созданы таблицы:

### users
- id (serial, primary key)
- username (varchar, unique)
- password (varchar, hashed)
- name (varchar)
- created_at (timestamp)

### leads
- id (serial, primary key)
- name (varchar)
- city (varchar)
- selected_car (varchar)
- purchase_method (varchar)
- client_quality (integer)
- traffic_source (varchar)
- summary_dialog (text)
- created_at (timestamp)
