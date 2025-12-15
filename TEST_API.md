# Тестирование API

## Тестовый запрос для добавления лида

Откройте PowerShell и выполните следующую команду:

```powershell
$body = @{
    name = "Асхат Нұрлан"
    city = "Алматы"
    selected_car = "Kia Sportage"
    purchase_method = "кредит"
    client_quality = 85
    traffic_source = "Instagram"
    summary_dialog = "Клиент заинтересован в покупке Kia Sportage. Хочет оформить в кредит на 5 лет. Готов приехать на тест-драйв в ближайшие дни."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/leads" -Method POST -Body $body -ContentType "application/json"
```

## Получение всех лидов

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/leads" -Method GET
```

## Тестовые данные для разных источников

### Лид из WhatsApp
```powershell
$body = @{
    name = "Айгуль Сапарова"
    city = "Астана"
    selected_car = "Kia Seltos"
    purchase_method = "наличные"
    client_quality = 92
    traffic_source = "WhatsApp"
    summary_dialog = "Клиент готов купить Kia Seltos за наличные. Интересует комплектация Luxe."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/leads" -Method POST -Body $body -ContentType "application/json"
```

### Лид из 2GIS
```powershell
$body = @{
    name = "Ерлан Абдуллаев"
    city = "Шымкент"
    selected_car = "Kia K5"
    purchase_method = "trade-in"
    client_quality = 65
    traffic_source = "2GIS"
    summary_dialog = "Клиент хочет обменять старый автомобиль на Kia K5. Нужна оценка trade-in."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/leads" -Method POST -Body $body -ContentType "application/json"
```

## Проверка работы

1. Запустите сервер: `npm run dev`
2. Откройте браузер: http://localhost:3001
3. Войдите с учетными данными:
   - Логин: admin
   - Пароль: admin123
4. Выполните тестовые запросы из PowerShell
5. Обновите страницу дашборда или подождите автоматического обновления (60 секунд)
