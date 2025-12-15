"use client"

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dashboard, useAuth } from '@/lib/auth-context'

interface EditDashboardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updates: { name: string; googleSheetsUrl: string; owner: string }) => void
  dashboard: Dashboard | null
}

export function EditDashboardModal({ 
  isOpen, 
  onClose, 
  onSave, 
  dashboard 
}: EditDashboardModalProps) {
  const { users } = useAuth()
  const [name, setName] = useState('')
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('')
  const [owner, setOwner] = useState('')

  useEffect(() => {
    if (dashboard) {
      setName(dashboard.name || '')
      setGoogleSheetsUrl(dashboard.googleSheetsUrl || '')
      setOwner(dashboard.owner || '')
    }
  }, [dashboard])

  const handleSave = () => {
    if (name?.trim() && googleSheetsUrl?.trim() && owner?.trim()) {
      onSave({
        name: name.trim(),
        googleSheetsUrl: googleSheetsUrl.trim(),
        owner: owner.trim()
      })
      onClose()
    }
  }

  const handleClose = () => {
    // Reset form when closing
    if (dashboard) {
      setName(dashboard.name || '')
      setGoogleSheetsUrl(dashboard.googleSheetsUrl || '')
      setOwner(dashboard.owner || '')
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать дашборд</DialogTitle>
          <DialogDescription>
            Внесите изменения в информацию о дашборде.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Название
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Введите название дашборда"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="owner" className="text-right">
              Владелец
            </Label>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите владельца" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.name}>
                    {user.name} ({user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="googleSheetsUrl" className="text-right pt-2">
              Ссылка на Google Sheets
            </Label>
            <Input
              id="googleSheetsUrl"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name?.trim() || !googleSheetsUrl?.trim() || !owner?.trim()}
          >
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
