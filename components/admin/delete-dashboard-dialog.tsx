"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dashboard } from '@/lib/auth-context'

interface DeleteDashboardDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  dashboard: Dashboard | null
}

export function DeleteDashboardDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  dashboard 
}: DeleteDashboardDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить дашборд</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить дашборд "{dashboard?.name}"? 
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

