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
import { User } from '@/lib/auth-context'

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  user: User | null
}

export function DeleteUserDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user 
}: DeleteUserDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить пользователя</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить пользователя "{user?.name}" ({user?.username})? 
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


