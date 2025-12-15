"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Removed sidebar imports since we're using custom sidebar
import { useAuth, User } from '@/lib/auth-context'
import { CreateDashboardModal } from './create-dashboard-modal'
import { DashboardCard } from './dashboard-card'
import { AdminSidebar } from './admin-sidebar'
import { CreateUserModal } from './create-user-modal'
import { EditUserModal } from './edit-user-modal'
import { DeleteUserDialog } from './delete-user-dialog'
import { Users, BarChart3, Plus, Settings, Trash2 } from 'lucide-react'

export function AdminPanel() {
  const { user, dashboards, users, createUser, editUser, deleteUser } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('dashboards')

  const handleCreateUser = (userData: Omit<User, 'id'>) => {
    createUser(userData)
  }

  const handleEditUser = (userData: { name: string; username: string; password: string; role: 'admin' | 'user' }) => {
    if (editingUser) {
      editUser(editingUser.id, userData)
    }
  }

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditUserModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
    setIsDeleteUserDialogOpen(true)
  }

  const handleConfirmDeleteUser = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id)
      setIsDeleteUserDialogOpen(false)
      setDeletingUser(null)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboards':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Управление дашбордами</h2>
                <p className="text-muted-foreground">
                  Создавайте и управляйте дашбордами для отслеживания лидов
                </p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Создать дашборд
              </Button>
            </div>

            {dashboards.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет дашбордов</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Создайте первый дашборд для начала работы с системой
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    Создать дашборд
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboards.map((dashboard) => (
                  <DashboardCard key={dashboard.id} dashboard={dashboard} />
                ))}
              </div>
            )}
          </div>
        )
      
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Управление пользователями</h2>
                <p className="text-muted-foreground">
                  Просматривайте и управляйте учетными записями пользователей
                </p>
              </div>
              <Button onClick={() => setIsCreateUserModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Создать пользователя
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Список пользователей</CardTitle>
                <CardDescription>
                  Все зарегистрированные пользователи системы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((userItem) => (
                    <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-foreground">
                            {userItem.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{userItem.name}</p>
                          <p className="text-sm text-muted-foreground">@{userItem.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={userItem.role === 'admin' ? 'default' : 'outline'}>
                          {userItem.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenEditUser(userItem)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(userItem)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="ml-16 min-h-screen">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-6">
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Административная панель</h1>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      <CreateDashboardModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      <CreateUserModal 
        isOpen={isCreateUserModalOpen} 
        onClose={() => setIsCreateUserModalOpen(false)}
        onCreate={handleCreateUser}
      />
      
      <EditUserModal 
        isOpen={isEditUserModalOpen} 
        onClose={() => {
          setIsEditUserModalOpen(false)
          setEditingUser(null)
        }}
        onSave={handleEditUser}
        user={editingUser}
      />
      
      <DeleteUserDialog 
        isOpen={isDeleteUserDialogOpen} 
        onClose={() => {
          setIsDeleteUserDialogOpen(false)
          setDeletingUser(null)
        }}
        onConfirm={handleConfirmDeleteUser}
        user={deletingUser}
      />
    </div>
  )
}
