import { db } from '../lib/db'
import { users } from '../lib/db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function createKiaUser() {
  try {
    // Check if kia user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, 'kia')).limit(1)
    
    if (existingUser.length > 0) {
      console.log('❌ Пользователь "kia" уже существует')
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash('kia123', 10)
    
    const newUser = await db.insert(users).values({
      username: 'kia',
      password: hashedPassword,
      name: 'Kia Qazaqstan',
    }).returning()

    console.log('✅ Пользователь Kia Qazaqstan успешно создан!')
    console.log('Логин: kia')
    console.log('Пароль: kia123')
    console.log('\nДанные пользователя:', newUser[0])
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error)
    process.exit(1)
  }
}

createKiaUser()
