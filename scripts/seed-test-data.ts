import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { leads } from '../lib/db/schema'

const cities = [
  'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе',
  'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау',
  'Костанай', 'Кызылорда', 'Уральск', 'Петропавловск', 'Актау'
]

const carModels = [
  'Kia Rio', 'Kia Sportage', 'Kia Sorento', 'Kia Seltos', 'Kia K5',
  'Kia Stinger', 'Kia Carnival', 'Kia Ceed', 'Kia Picanto', 'Kia Soul',
  'Kia EV6', 'Kia Niro'
]

const purchaseMethods = [
  'Наличные', 'Кредит', 'Трейд-ин'
]

const trafficSources = [
  'Instagram', '2GIS', 'WhatsApp'
]

const firstNames = [
  'Александр', 'Дмитрий', 'Максим', 'Сергей', 'Андрей',
  'Алексей', 'Артем', 'Нурлан', 'Ерлан', 'Арман',
  'Данияр', 'Асхат', 'Бауыржан', 'Ержан', 'Мурат',
  'Айдар', 'Тимур', 'Жанат', 'Серик', 'Болат',
  'Абай', 'Амир', 'Азамат', 'Руслан', 'Олег'
]

const lastNames = [
  'Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов',
  'Абдуллаев', 'Сапаров', 'Нурланов', 'Касымов', 'Жумабаев',
  'Ахметов', 'Есенов', 'Токаев', 'Байжанов', 'Садыков',
  'Алимов', 'Омаров', 'Мухамедов', 'Бекболатов', 'Исаев'
]

const dialogTemplates = [
  (name: string, car: string) => `Клиент ${name} интересовался моделью ${car}. Обсудили комплектации и цены. Клиент заинтересован в тест-драйве. Планируется встреча в салоне на следующей неделе.`,
  (name: string, car: string) => `${name} звонил по поводу ${car}. Уточнял наличие в салоне, цену и возможность трейд-ина. Отправил коммерческое предложение на WhatsApp. Клиент обещал перезвонить через пару дней.`,
  (name: string, car: string) => `Обращение от ${name} через Instagram. Интерес к ${car}. Провели консультацию по телефону, ответили на все вопросы. Клиент просил время подумать.`,
  (name: string, car: string) => `${name} пришел в салон для осмотра ${car}. Провели тест-драйв. Клиенту очень понравилось. Обсудили условия покупки и финансирование. Высокая вероятность сделки.`,
  (name: string, car: string) => `Клиент ${name} заинтересован в покупке ${car} в кредит. Рассчитали ежемесячный платеж, обсудили первоначальный взнос. Клиент подал заявку на кредит.`,
  (name: string, car: string) => `${name} обратился за консультацией по ${car}. Сравнивал с конкурентами. Отправил презентацию модели и прайс-лист через 2GIS. Договорились созвониться на следующей неделе.`,
  (name: string, car: string) => `${name} нашел нас через 2GIS. Интересуется ${car}. Записались на тест-драйв на выходные. Клиент готов обсуждать условия покупки.`,
  (name: string, car: string) => `Контакт через WhatsApp от ${name}. Вопросы по ${car} и актуальным акциям. Отправили каталог и спецпредложения. Ждем обратной связи.`,
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  return date
}

async function seedTestData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? undefined : { rejectUnauthorized: false },
  })

  const db = drizzle(pool, {})

  try {
    console.log('🌱 Начинаем генерацию тестовых данных...')

    const testLeads = []

    for (let i = 0; i < 50; i++) {
      const firstName = getRandomElement(firstNames)
      const lastName = getRandomElement(lastNames)
      const fullName = `${firstName} ${lastName}`
      const car = getRandomElement(carModels)

      const lead = {
        name: fullName,
        city: getRandomElement(cities),
        selectedCar: car,
        purchaseMethod: getRandomElement(purchaseMethods),
        clientQuality: Math.floor(Math.random() * 5) + 1, // 1-5
        trafficSource: getRandomElement(trafficSources),
        summaryDialog: getRandomElement(dialogTemplates)(firstName, car),
        createdAt: getRandomDate(90), // последние 90 дней
      }

      testLeads.push(lead)
    }

    // Insert all leads
    await db.insert(leads).values(testLeads)

    console.log(`✅ Успешно создано ${testLeads.length} тестовых лидов!`)
    console.log('📊 Статистика:')
    console.log(`   Диапазон дат: последние 90 дней`)
    console.log(`   Городов: ${cities.length}`)
    console.log(`   Моделей авто: ${carModels.length}`)

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при генерации данных:', error)
    await pool.end()
    process.exit(1)
  }
}

seedTestData()
