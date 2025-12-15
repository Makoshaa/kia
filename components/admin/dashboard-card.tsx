"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dashboard, useAuth } from '@/lib/auth-context'
import { BarChart3, User, Calendar, ExternalLink, Settings, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { DeleteDashboardDialog } from './delete-dashboard-dialog'
import { EditDashboardModal } from './edit-dashboard-modal'

interface DashboardCardProps {
  dashboard: Dashboard
}

export function DashboardCard({ dashboard }: DashboardCardProps) {
  const router = useRouter()
  const { deleteDashboard, editDashboard } = useAuth()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleOpenDashboard = () => {
    // Navigate to the dashboard viewer page
    router.push(`/dashboard/${dashboard.id}`)
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteDashboard(dashboard.id)
    setIsDeleteDialogOpen(false)
  }

  const handleSaveEdit = (updates: { name: string; googleSheetsUrl: string; owner: string }) => {
    editDashboard(dashboard.id, updates)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru })
    } catch {
      return 'Неизвестная дата'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{dashboard.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{dashboard.owner}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Создан: {formatDate(dashboard.createdAt)}</span>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Ссылка на Google Sheets:</p>
            <div className="p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground break-all">
                {dashboard.googleSheetsUrl}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="text-xs">
            Активный
          </Badge>
          <Button 
            size="sm" 
            onClick={handleOpenDashboard}
            className="flex items-center space-x-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Открыть</span>
          </Button>
        </div>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <DeleteDashboardDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        dashboard={dashboard}
      />
      
      {/* Edit Modal */}
      <EditDashboardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        dashboard={dashboard}
      />
    </Card>
  )
}
