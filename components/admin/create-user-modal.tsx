"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User } from '@/lib/auth-context'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (userData: Omit<User, 'id'>) => void
}

export function CreateUserModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: CreateUserModalProps) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')

  const handleCreate = () => {
    if (name.trim() && username.trim() && password.trim()) {
      onCreate({
        name: name.trim(),
        username: username.trim(),
        password: password.trim(),
        role
      })
      handleClose()
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setName('')
    setUsername('')
    setPassword('')
    setRole('user')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать пользователя</DialogTitle>
          <DialogDescription>
            Добавьте нового пользователя в систему.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Имя
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Введите полное имя"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Логин
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              placeholder="Введите логин"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder="Введите пароль"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Роль
            </Label>
            <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Пользователь</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!name.trim() || !username.trim() || !password.trim()}
          >
            Создать пользователя
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
