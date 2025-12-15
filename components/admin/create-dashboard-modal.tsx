"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth, extractSheetInfo } from '@/lib/auth-context'
import { Loader2, Link, User, FileText } from 'lucide-react'

interface CreateDashboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateDashboardModal({ isOpen, onClose }: CreateDashboardModalProps) {
  const [dashboardName, setDashboardName] = useState('')
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('')
  const [selectedOwner, setSelectedOwner] = useState('')
  const [leadSource, setLeadSource] = useState(false)
  const [leadCategories, setLeadCategories] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { addDashboard, users } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate form
      if (!dashboardName.trim()) {
        setError('Название дашборда обязательно')
        return
      }

      if (!googleSheetsUrl.trim()) {
        setError('Ссылка на Google Sheets обязательна')
        return
      }

      if (!selectedOwner) {
        setError('Выберите владельца дашборда')
        return
      }

      // Validate Google Sheets URL format
      try {
        const url = new URL(googleSheetsUrl.trim())
        if (!url.hostname.includes('docs.google.com') || !url.pathname.includes('/spreadsheets/')) {
          setError('Введите корректную ссылку на Google Sheets')
          return
        }
      } catch {
        setError('Введите корректную ссылку на Google Sheets')
        return
      }

      // Create dashboard
      const owner = users.find(u => u.id === selectedOwner)
      if (!owner) {
        setError('Выбранный пользователь не найден')
        return
      }

      addDashboard({
        name: dashboardName.trim(),
        googleSheetsUrl: googleSheetsUrl.trim(),
        owner: owner.name,
        additionalColumns: {
          leadSource,
          leadCategories
        }
      })

      // Reset form
      setDashboardName('')
      setGoogleSheetsUrl('')
      setSelectedOwner('')
      setLeadSource(false)
      setLeadCategories(false)
      
      // Close modal
      onClose()
    } catch (err) {
      setError('Произошла ошибка при создании дашборда')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setDashboardName('')
      setGoogleSheetsUrl('')
      setSelectedOwner('')
      setLeadSource(false)
      setLeadCategories(false)
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Создать дашборд
          </DialogTitle>
          <DialogDescription>
            Заполните информацию для создания нового дашборда
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dashboardName">Название дашборда</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="dashboardName"
                placeholder="Введите название дашборда"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleSheetsUrl">Ссылка на Google Sheets</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="googleSheetsUrl"
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0"
                value={googleSheetsUrl}
                onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Вставьте полную ссылку на Google Sheets - ID и GID будут извлечены автоматически
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Владелец дашборда</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
              <Select value={selectedOwner} onValueChange={setSelectedOwner} disabled={isLoading}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Выберите владельца" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} (@{user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Дополнительные колонки</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leadSource"
                  checked={leadSource}
                  onCheckedChange={setLeadSource}
                  disabled={isLoading}
                />
                <Label htmlFor="leadSource" className="text-sm font-normal">
                  Источник лида
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leadCategories"
                  checked={leadCategories}
                  onCheckedChange={setLeadCategories}
                  disabled={isLoading}
                />
                <Label htmlFor="leadCategories" className="text-sm font-normal">
                  Лиды по категориям
                </Label>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать дашборд
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
