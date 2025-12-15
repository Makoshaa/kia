import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { users } from '../lib/db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function setupProduction() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  const db = drizzle(pool, {})

  try {
    console.log('🚀 Начинаем настройку production БД...')

    // Run migrations
    console.log('📦 Применяем миграции...')
    try {
      await migrate(db, { migrationsFolder: './drizzle' })
      console.log('✅ Миграции применены успешно!')
    } catch (error: any) {
      if (error?.cause?.code === '42P07') {
        console.log('ℹ️  Таблицы уже существуют, пропускаем миграции')
      } else {
        throw error
      }
    }

    // Check if admin user exists
    console.log('👤 Проверяем существование пользователя admin...')
    const existingUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1)

    if (existingUser.length > 0) {
      console.log('ℹ️  Пользователь "admin" уже существует')
    } else {
      // Create admin user
      console.log('👤 Создаем пользователя admin...')
      const hashedPassword = await bcrypt.hash('admin123', 10)

      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
      })

      console.log('✅ Пользователь admin создан!')
      console.log('   Логин: admin')
      console.log('   Пароль: admin123')
    }

    console.log('\n✅ Production БД настроена успешно!')
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при настройке БД:', error)
    await pool.end()
    process.exit(1)
  }
}

setupProduction()
