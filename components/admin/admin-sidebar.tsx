"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { BarChart3, Users, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { user, logout } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  const menuItems = [
    {
      id: 'dashboards',
      label: 'Дашборды',
      icon: BarChart3,
    },
    {
      id: 'users',
      label: 'Пользователи',
      icon: Users,
    },
  ]

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-50 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isHovered ? "w-80" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="flex-shrink-0">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        {isHovered && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Панель управления</h1>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {isHovered && (
            <h2 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-4">
              Навигация
            </h2>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full justify-start h-12 transition-all duration-200",
                  isHovered ? "px-3" : "px-2"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isHovered && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="space-y-3">
          {/* User Profile */}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            isHovered ? "bg-sidebar-accent/50" : "justify-center"
          )}>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.name.charAt(0)}
              </span>
            </div>
            {isHovered && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  Администратор
                </Badge>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className={cn(
              "w-full h-12 transition-all duration-200",
              isHovered ? "justify-start px-3" : "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isHovered && (
              <span className="ml-3 text-sm font-medium">Выйти</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
