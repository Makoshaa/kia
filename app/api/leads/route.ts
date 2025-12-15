import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Проверка API ключа
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.API_KEY
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Отсутствует токен авторизации. Используйте заголовок: Authorization: Bearer YOUR_API_KEY' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7) // Убираем "Bearer "
    
    if (token !== apiKey) {
      return NextResponse.json(
        { error: 'Неверный API ключ' },
        { status: 403 }
      )
    }
    
    const body = await request.json()

    const { name, city, selected_car, purchase_method, client_quality, traffic_source, summary_dialog } = body

    if (!name || !city || !selected_car || !purchase_method || client_quality === undefined || !traffic_source || !summary_dialog) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    if (typeof client_quality !== 'number' || client_quality < 0 || client_quality > 100) {
      return NextResponse.json(
        { error: 'client_quality должен быть числом от 0 до 100' },
        { status: 400 }
      )
    }

    const newLead = await db.insert(leads).values({
      name,
      city,
      selectedCar: selected_car,
      purchaseMethod: purchase_method,
      clientQuality: client_quality,
      trafficSource: traffic_source,
      summaryDialog: summary_dialog,
    }).returning()

    return NextResponse.json(
      { 
        message: 'Лид успешно добавлен',
        lead: newLead[0]
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Ошибка при добавлении лида:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt))

    return NextResponse.json({ leads: allLeads }, { status: 200 })
  } catch (error) {
    console.error('Ошибка при получении лидов:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
