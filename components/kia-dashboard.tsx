"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context-new'
import { LogOut, RefreshCw, TrendingUp, Users, Target, Activity, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'

interface Lead {
  id: number
  name: string
  city: string
  selectedCar: string
  purchaseMethod: string
  clientQuality: number
  trafficSource: string
  summaryDialog: string
  createdAt: string
}

export function KiaDashboard() {
  const { logout, user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
      }
    } catch (error) {
      console.error('Ошибка при загрузке лидов:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    
    const interval = setInterval(() => {
      fetchLeads()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const getQualityColor = (quality: number) => {
    if (quality >= 70) return 'bg-green-100 text-green-800'
    if (quality >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getQualityLabel = (quality: number) => {
    if (quality >= 70) return 'Высокий'
    if (quality >= 40) return 'Средний'
    return 'Низкий'
  }

  const totalLeads = leads.length
  const avgQuality = leads.length > 0 
    ? Math.round(leads.reduce((sum, lead) => sum + lead.clientQuality, 0) / leads.length)
    : 0
  const highQualityLeads = leads.filter(lead => lead.clientQuality >= 70).length

  const leadsBySource = leads.reduce((acc, lead) => {
    acc[lead.trafficSource] = (acc[lead.trafficSource] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kia Qazaqstan</h1>
            <p className="text-sm text-gray-500">Панель управления лидами</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Привет, {user?.name}</span>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Статистика</h2>
          <Button onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего лидов</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний качество</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgQuality}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Высокое качество</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highQualityLeads}</div>
              <p className="text-xs text-muted-foreground">Качество ≥ 70%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalLeads > 0 ? Math.round((highQualityLeads / totalLeads) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Источники трафика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(leadsBySource).map(([source, count]) => (
                <Badge key={source} variant="secondary" className="text-sm py-2 px-4">
                  {source}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Все лиды</CardTitle>
            <CardDescription>
              Автоматическое обновление каждую минуту
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Город</TableHead>
                    <TableHead>Автомобиль</TableHead>
                    <TableHead>Способ покупки</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Качество</TableHead>
                    <TableHead>Резюме</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Загрузка...
                      </TableCell>
                    </TableRow>
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Лидов пока нет
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(lead.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </TableCell>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.city}</TableCell>
                        <TableCell>{lead.selectedCar}</TableCell>
                        <TableCell>{lead.purchaseMethod}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.trafficSource}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getQualityColor(lead.clientQuality)}>
                            {getQualityLabel(lead.clientQuality)} ({lead.clientQuality}%)
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {lead.summaryDialog}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
