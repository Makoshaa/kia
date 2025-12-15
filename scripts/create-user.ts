import { db } from '../lib/db'
import { users } from '../lib/db/schema'
import bcrypt from 'bcryptjs'

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const newUser = await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      name: 'Администратор Kia Qazaqstan',
    }).returning()

    console.log('Пользователь успешно создан:', newUser[0])
    process.exit(0)
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error)
    process.exit(1)
  }
}

createUser()
