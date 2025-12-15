import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Имя пользователя и пароль обязательны' },
        { status: 400 }
      )
    }

    const user = await db.select().from(users).where(eq(users.username, username)).limit(1)

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user[0].id,
        username: user[0].username,
        name: user[0].name,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Ошибка при авторизации:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
