"use client"

import { useAuth, extractSheetInfo } from '@/lib/auth-context'
import { DashboardViewer } from '@/components/dashboard/dashboard-viewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, User } from 'lucide-react'

export function UserDashboard() {
  const { user, dashboards, logout } = useAuth()

  // Get the first dashboard assigned to this user
  const userDashboard = dashboards.find(dashboard => dashboard.owner === user?.name)

  // If user has a dashboard, show it with header
  if (userDashboard) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header with user info and logout */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-end px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <Badge variant="outline" className="text-xs">
                    Пользователь
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </header>
        
        {/* Dashboard content */}
        <DashboardViewer 
          endpoint={(() => {
            const { sheetId, gid } = extractSheetInfo(userDashboard.googleSheetsUrl)
            const endpoint = `https://script.google.com/macros/s/AKfycbzHDO9JObYjTE7gZnxWylkKVrtOE6iItZKcY5JB2eYraVF_qIU4iwHsC1cFk-FBlFCjkg/exec?sheetId=${sheetId}&gid=${gid}`
            console.log('User Dashboard - Original URL:', userDashboard.googleSheetsUrl)
            console.log('User Dashboard - Generated endpoint:', endpoint)
            return endpoint
          })()}
          title={userDashboard.name}
          showConnectionForm={false}
          autoRefresh={true}
        />
      </div>
    )
  }

  // If no dashboard assigned, show a simple message with header
  return (
    <div className="min-h-screen bg-background">
      {/* Header with user info and logout */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-end px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <Badge variant="outline" className="text-xs">
                  Пользователь
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>
      </header>
      
      {/* No dashboard message */}
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Нет назначенных дашбордов</h1>
          <p className="text-muted-foreground">
            Обратитесь к администратору для получения доступа к дашбордам
          </p>
        </div>
      </div>
    </div>
  )
}
