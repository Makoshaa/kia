import { db } from '../lib/db'
import { leads } from '../lib/db/schema'

const testLeads = [
  {
    name: 'Асхат Нұрлан',
    city: 'Алматы',
    selectedCar: 'Kia Sportage',
    purchaseMethod: 'кредит',
    clientQuality: 85,
    trafficSource: 'Instagram',
    summaryDialog: 'Клиент заинтересован в покупке Kia Sportage. Хочет оформить в кредит на 5 лет. Готов приехать на тест-драйв в ближайшие дни. Интересуется комплектацией Luxe.'
  },
  {
    name: 'Айгуль Сапарова',
    city: 'Астана',
    selectedCar: 'Kia Seltos',
    purchaseMethod: 'наличные',
    clientQuality: 92,
    trafficSource: 'WhatsApp',
    summaryDialog: 'Клиентка готова купить Kia Seltos за наличные. Интересует комплектация в максимальной комплектации. Хочет посмотреть автомобиль в белом цвете.'
  },
  {
    name: 'Ерлан Абдуллаев',
    city: 'Шымкент',
    selectedCar: 'Kia K5',
    purchaseMethod: 'trade-in',
    clientQuality: 65,
    trafficSource: '2GIS',
    summaryDialog: 'Клиент хочет обменять старый автомобиль Toyota Camry 2015 года на Kia K5. Нужна оценка trade-in и расчет доплаты.'
  },
  {
    name: 'Дина Жаксылыкова',
    city: 'Караганда',
    selectedCar: 'Kia Sorento',
    purchaseMethod: 'кредит',
    clientQuality: 78,
    trafficSource: 'Instagram',
    summaryDialog: 'Семья интересуется покупкой 7-местного внедорожника. Рассматривают Kia Sorento. Нужна консультация по кредитным программам с минимальным первоначальным взносом.'
  },
  {
    name: 'Бекзат Оразов',
    city: 'Атырау',
    selectedCar: 'Kia Carnival',
    purchaseMethod: 'наличные',
    clientQuality: 95,
    trafficSource: 'WhatsApp',
    summaryDialog: 'Клиент срочно ищет минивэн для большой семьи. Готов купить Kia Carnival в ближайшее время за наличные. Интересует наличие на складе и сроки оформления.'
  },
  {
    name: 'Гульнара Садыкова',
    city: 'Алматы',
    selectedCar: 'Kia Rio',
    purchaseMethod: 'кредит',
    clientQuality: 45,
    trafficSource: '2GIS',
    summaryDialog: 'Клиентка интересуется бюджетным автомобилем для города. Рассматривает Kia Rio, но пока не уверена. Нужно время на раздумья.'
  },
  {
    name: 'Мурат Темиров',
    city: 'Астана',
    selectedCar: 'Kia Stinger',
    purchaseMethod: 'наличные',
    clientQuality: 88,
    trafficSource: 'Instagram',
    summaryDialog: 'Клиент ищет спортивный седан с мощным двигателем. Заинтересован в Kia Stinger GT. Хочет записаться на тест-драйв на этой неделе.'
  },
  {
    name: 'Сауле Нурбекова',
    city: 'Шымкент',
    selectedCar: 'Kia Sportage',
    purchaseMethod: 'trade-in',
    clientQuality: 70,
    trafficSource: 'WhatsApp',
    summaryDialog: 'Клиентка хочет обменять Hyundai Tucson 2017 на новый Kia Sportage. Интересуют условия trade-in и возможные скидки.'
  },
  {
    name: 'Ернар Кенжебеков',
    city: 'Павлодар',
    selectedCar: 'Kia Telluride',
    purchaseMethod: 'кредит',
    clientQuality: 82,
    trafficSource: '2GIS',
    summaryDialog: 'Клиент интересуется флагманским внедорожником Kia Telluride. Нужна консультация по кредитным программам и наличию в комплектации Prestige.'
  },
  {
    name: 'Алия Бектурова',
    city: 'Алматы',
    selectedCar: 'Kia EV6',
    purchaseMethod: 'наличные',
    clientQuality: 90,
    trafficSource: 'Instagram',
    summaryDialog: 'Клиентка заинтересована в электромобиле Kia EV6. Готова к покупке. Интересуют технические характеристики, запас хода и инфраструктура зарядных станций в городе.'
  }
]

async function seedTestData() {
  try {
    console.log('Начинаем добавление тестовых данных...')
    
    for (const lead of testLeads) {
      const result = await db.insert(leads).values(lead).returning()
      console.log(`✓ Добавлен лид: ${result[0].name} (ID: ${result[0].id})`)
    }
    
    console.log('\n✅ Все тестовые данные успешно добавлены!')
    console.log(`Всего добавлено: ${testLeads.length} лидов`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error)
    process.exit(1)
  }
}

seedTestData()
