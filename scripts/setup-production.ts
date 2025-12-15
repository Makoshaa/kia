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
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Миграции применены успешно!')

    // Check if kia user exists
    console.log('👤 Проверяем существование пользователя kia...')
    const existingUser = await db.select().from(users).where(eq(users.username, 'kia')).limit(1)

    if (existingUser.length > 0) {
      console.log('ℹ️  Пользователь "kia" уже существует')
    } else {
      // Create kia user
      console.log('👤 Создаем пользователя kia...')
      const hashedPassword = await bcrypt.hash('kia123', 10)

      await db.insert(users).values({
        username: 'kia',
        password: hashedPassword,
        name: 'Kia Qazaqstan',
      })

      console.log('✅ Пользователь kia создан!')
      console.log('   Логин: kia')
      console.log('   Пароль: kia123')
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
