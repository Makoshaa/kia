# API Документация - Kia Qazaqstan

## Базовый URL
```
http://localhost:3001/api
```

## Endpoints

### 1. Добавление лида (POST /api/leads)

Этот endpoint используется для отправки новых лидов из вашей no-code платформы.

**URL:** `POST /api/leads`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Иван Иванов",
  "city": "Алматы",
  "selected_car": "Kia Sportage",
  "purchase_method": "кредит",
  "client_quality": 85,
  "traffic_source": "Instagram",
  "summary_dialog": "Клиент интересуется покупкой Kia Sportage в кредит. Готов приехать на тест-драйв на следующей неделе."
}
```

**Описание полей:**
- `name` (string, обязательно) - Имя клиента
- `city` (string, обязательно) - Город
- `selected_car` (string, обязательно) - Выбранный автомобиль
- `purchase_method` (string, обязательно) - Способ покупки (наличные, кредит, trade-in)
- `client_quality` (number, обязательно) - Качество лида (0-100)
- `traffic_source` (string, обязательно) - Источник обращения (Instagram, WhatsApp, 2GIS)
- `summary_dialog` (text, обязательно) - Резюме диалога

**Успешный ответ (201):**
```json
{
  "message": "Лид успешно добавлен",
  "lead": {
    "id": 1,
    "name": "Иван Иванов",
    "city": "Алматы",
    "selectedCar": "Kia Sportage",
    "purchaseMethod": "кредит",
    "clientQuality": 85,
    "trafficSource": "Instagram",
    "summaryDialog": "Клиент интересуется покупкой Kia Sportage в кредит...",
    "createdAt": "2025-12-11T15:30:00.000Z"
  }
}
```

**Ошибки:**
- `400 Bad Request` - Отсутствуют обязательные поля или некорректные данные
- `500 Internal Server Error` - Ошибка сервера

### 2. Получение всех лидов (GET /api/leads)

**URL:** `GET /api/leads`

**Успешный ответ (200):**
```json
{
  "leads": [
    {
      "id": 1,
      "name": "Иван Иванов",
      "city": "Алматы",
      "selectedCar": "Kia Sportage",
      "purchaseMethod": "кредит",
      "clientQuality": 85,
      "trafficSource": "Instagram",
      "summaryDialog": "Клиент интересуется покупкой...",
      "createdAt": "2025-12-11T15:30:00.000Z"
    }
  ]
}
```

## Примеры использования

### cURL
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Иванов",
    "city": "Алматы",
    "selected_car": "Kia Sportage",
    "purchase_method": "кредит",
    "client_quality": 85,
    "traffic_source": "Instagram",
    "summary_dialog": "Клиент интересуется покупкой Kia Sportage в кредит"
  }'
```

### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:3001/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Иван Иванов',
    city: 'Алматы',
    selected_car: 'Kia Sportage',
    purchase_method: 'кредит',
    client_quality: 85,
    traffic_source: 'Instagram',
    summary_dialog: 'Клиент интересуется покупкой Kia Sportage в кредит'
  })
});

const data = await response.json();
console.log(data);
```

### Python (requests)
```python
import requests

url = 'http://localhost:3001/api/leads'
payload = {
    'name': 'Иван Иванов',
    'city': 'Алматы',
    'selected_car': 'Kia Sportage',
    'purchase_method': 'кредит',
    'client_quality': 85,
    'traffic_source': 'Instagram',
    'summary_dialog': 'Клиент интересуется покупкой Kia Sportage в кредит'
}

response = requests.post(url, json=payload)
print(response.json())
```

## База данных

### Таблица users
- `id` - Primary Key (автоинкремент)
- `username` - Логин пользователя (уникальный)
- `password` - Хешированный пароль
- `name` - Имя пользователя
- `created_at` - Дата создания

### Таблица leads
- `id` - Primary Key (автоинкремент)
- `name` - Имя клиента
- `city` - Город
- `selected_car` - Выбранный автомобиль
- `purchase_method` - Способ покупки
- `client_quality` - Качество лида (0-100)
- `traffic_source` - Источник трафика
- `summary_dialog` - Резюме диалога
- `created_at` - Дата создания

## Авторизация

Для доступа к дашборду используйте:
- **Логин:** admin
- **Пароль:** admin123

## Автоматическое обновление

Дашборд автоматически обновляет данные каждые 60 секунд.
