# API Endpoint для добавления лидов

## Endpoint для добавления лида

**URL:** `https://your-domain.com/api/leads`  
**Метод:** `POST`  
**Content-Type:** `application/json`

## Аутентификация

Для безопасности endpoint защищен API ключом. Вам нужно добавить заголовок:

```
Authorization: Bearer YOUR_API_KEY
```

### Настройка API ключа

1. Откройте файл `.env.local` в корне проекта
2. Найдите строку `API_KEY=your-secret-api-key-change-me`
3. Замените `your-secret-api-key-change-me` на ваш секретный ключ
4. Перезапустите сервер для применения изменений

**Пример:**
```env
API_KEY=my-super-secret-key-123456
```

## Формат запроса

### Обязательные поля

```json
{
  "name": "Имя клиента",
  "city": "Город",
  "selected_car": "Название автомобиля",
  "purchase_method": "кредит | наличные | трейд-ин",
  "client_quality": 75,
  "traffic_source": "instagram | facebook | google | сайт | звонок",
  "summary_dialog": "Краткое резюме диалога с клиентом"
}
```

### Описание полей

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `name` | string | Имя клиента | "Иван Иванов" |
| `city` | string | Город клиента | "Алматы" |
| `selected_car` | string | Модель автомобиля | "Kia Sportage" |
| `purchase_method` | string | Способ покупки | "кредит" |
| `client_quality` | number | Качество лида (0-100) | 75 |
| `traffic_source` | string | Источник трафика | "instagram" |
| `summary_dialog` | string | Резюме диалога | "Клиент интересуется..." |

## Примеры использования

### cURL

```bash
curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-api-key-change-me" \
  -d '{
    "name": "Иван Петров",
    "city": "Алматы",
    "selected_car": "Kia Sportage",
    "purchase_method": "кредит",
    "client_quality": 85,
    "traffic_source": "instagram",
    "summary_dialog": "Клиент заинтересован в покупке Kia Sportage в кредит. Планирует визит в салон на следующей неделе."
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('https://your-domain.com/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-secret-api-key-change-me'
  },
  body: JSON.stringify({
    name: 'Иван Петров',
    city: 'Алматы',
    selected_car: 'Kia Sportage',
    purchase_method: 'кредит',
    client_quality: 85,
    traffic_source: 'instagram',
    summary_dialog: 'Клиент заинтересован в покупке Kia Sportage в кредит.'
  })
});

const data = await response.json();
console.log(data);
```

### Python

```python
import requests

url = "https://your-domain.com/api/leads"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-secret-api-key-change-me"
}
payload = {
    "name": "Иван Петров",
    "city": "Алматы",
    "selected_car": "Kia Sportage",
    "purchase_method": "кредит",
    "client_quality": 85,
    "traffic_source": "instagram",
    "summary_dialog": "Клиент заинтересован в покупке Kia Sportage в кредит."
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### PHP

```php
<?php
$url = "https://your-domain.com/api/leads";
$data = [
    "name" => "Иван Петров",
    "city" => "Алматы",
    "selected_car" => "Kia Sportage",
    "purchase_method" => "кредит",
    "client_quality" => 85,
    "traffic_source" => "instagram",
    "summary_dialog" => "Клиент заинтересован в покупке Kia Sportage в кредит."
];

$options = [
    'http' => [
        'header'  => [
            "Content-Type: application/json",
            "Authorization: Bearer your-secret-api-key-change-me"
        ],
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo $result;
?>
```

## Ответы сервера

### Успешный ответ (201 Created)

```json
{
  "message": "Лид успешно добавлен",
  "lead": {
    "id": 123,
    "name": "Иван Петров",
    "city": "Алматы",
    "selectedCar": "Kia Sportage",
    "purchaseMethod": "кредит",
    "clientQuality": 85,
    "trafficSource": "instagram",
    "summaryDialog": "Клиент заинтересован в покупке Kia Sportage в кредит.",
    "createdAt": "2025-12-12T10:30:00.000Z"
  }
}
```

### Ошибки

#### 401 Unauthorized - Отсутствует токен

```json
{
  "error": "Отсутствует токен авторизации. Используйте заголовок: Authorization: Bearer YOUR_API_KEY"
}
```

#### 403 Forbidden - Неверный API ключ

```json
{
  "error": "Неверный API ключ"
}
```

#### 400 Bad Request - Отсутствуют обязательные поля

```json
{
  "error": "Все поля обязательны для заполнения"
}
```

#### 400 Bad Request - Неверное значение client_quality

```json
{
  "error": "client_quality должен быть числом от 0 до 100"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Внутренняя ошибка сервера"
}
```

## Безопасность

⚠️ **Важно:**
- Никогда не публикуйте ваш API ключ в публичных репозиториях
- Используйте HTTPS для всех запросов к API
- Периодически меняйте API ключ
- Храните API ключ в безопасном месте
- Не передавайте API ключ через URL параметры

## Тестирование

Для локального тестирования используйте:

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-api-key-change-me" \
  -d '{
    "name": "Тест Тестов",
    "city": "Алматы",
    "selected_car": "Kia Sportage",
    "purchase_method": "кредит",
    "client_quality": 75,
    "traffic_source": "сайт",
    "summary_dialog": "Тестовый лид для проверки API"
  }'
```
