"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context-new'
import { LogOut, RefreshCw, TrendingUp, Users, Target, Activity, BarChart3, PieChart as PieChartIcon, Calendar, Car, CreditCard } from 'lucide-react'
import { format, startOfDay, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from 'recharts'

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

const COLORS = {
  Instagram: '#E4405F',
  WhatsApp: '#25D366',
  '2GIS': '#00A82D',
  default: '#8884d8'
}

const QUALITY_COLORS = {
  high: '#10b981',
  medium: '#f59e0b',
  low: '#ef4444'
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

  // Период для графика динамики
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week')
  
  // Состояние для модального окна
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Статистика
  const stats = useMemo(() => {
    const total = leads.length
    const avgQuality = total > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.clientQuality, 0) / total) : 0
    const highQuality = leads.filter(lead => lead.clientQuality >= 70).length
    const mediumQuality = leads.filter(lead => lead.clientQuality >= 40 && lead.clientQuality < 70).length
    const lowQuality = leads.filter(lead => lead.clientQuality < 40).length
    const conversion = total > 0 ? Math.round((highQuality / total) * 100) : 0
    
    // Последний лид
    const lastLead = leads.length > 0 ? leads[0] : null

    return { total, avgQuality, highQuality, mediumQuality, lowQuality, conversion, lastLead }
  }, [leads])

  // Данные для графика по источникам
  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {}
    leads.forEach(lead => {
      sources[lead.trafficSource] = (sources[lead.trafficSource] || 0) + 1
    })
    return Object.entries(sources).map(([name, value]) => ({ name, value }))
  }, [leads])

  // Данные для графика по качеству
  const qualityData = useMemo(() => [
    { name: 'Высокое (≥70%)', value: stats.highQuality, color: QUALITY_COLORS.high },
    { name: 'Среднее (40-69%)', value: stats.mediumQuality, color: QUALITY_COLORS.medium },
    { name: 'Низкое (<40%)', value: stats.lowQuality, color: QUALITY_COLORS.low },
  ], [stats])

  // Данные для графика по городам
  const cityData = useMemo(() => {
    const cities: Record<string, number> = {}
    leads.forEach(lead => {
      cities[lead.city] = (cities[lead.city] || 0) + 1
    })
    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [leads])

  // Данные для графика по автомобилям
  const carData = useMemo(() => {
    const cars: Record<string, number> = {}
    leads.forEach(lead => {
      cars[lead.selectedCar] = (cars[lead.selectedCar] || 0) + 1
    })
    return Object.entries(cars)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [leads])

  // Данные для графика по способам покупки
  const paymentData = useMemo(() => {
    const methods: Record<string, number> = {}
    leads.forEach(lead => {
      methods[lead.purchaseMethod] = (methods[lead.purchaseMethod] || 0) + 1
    })
    return Object.entries(methods).map(([name, value]) => ({ name, value }))
  }, [leads])

  // Данные для графика по дням с учетом периода
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {}
    const now = new Date()
    let startDate: Date
    let formatPattern: string

    switch (timePeriod) {
      case 'week':
        startDate = subDays(now, 7)
        formatPattern = 'dd.MM'
        break
      case 'month':
        startDate = subDays(now, 30)
        formatPattern = 'dd.MM'
        break
      case 'year':
        startDate = subDays(now, 365)
        formatPattern = 'MMM yy'
        break
    }

    leads.forEach(lead => {
      const leadDate = new Date(lead.createdAt)
      if (leadDate >= startDate) {
        const day = format(leadDate, formatPattern, { locale: ru })
        days[day] = (days[day] || 0) + 1
      }
    })

    const data = Object.entries(days)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })

    // Ключевые метрики
    const maxCount = Math.max(...data.map(d => d.count), 0)
    const bestDay = data.find(d => d.count === maxCount)?.date || '-'
    const avgPerDay = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.count, 0) / data.length) : 0

    return { data, maxCount, bestDay, avgPerDay }
  }, [leads, timePeriod])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Kia Qazaqstan
              </h1>
              <p className="text-sm text-gray-500">Панель управления лидами</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Привет, {user?.name}</span>
            <Button variant="outline" onClick={logout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-sm font-medium">Всего лидов</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Все обращения</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-purple-500" />
                </div>
                <CardTitle className="text-sm font-medium">Среднее качество</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgQuality}%</div>
              <p className="text-xs text-muted-foreground mt-1">Общий показатель</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-500" />
                </div>
                <CardTitle className="text-sm font-medium">Высокое качество</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.highQuality}</div>
              <p className="text-xs text-muted-foreground mt-1">Качество ≥ 70%</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
                <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.total > 0 ? Math.round((stats.highQuality / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Горячие лиды</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs with Charts and Table */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Обзор
              </TabsTrigger>
              <TabsTrigger value="table">
                <Users className="h-4 w-4 mr-2" />
                Все лиды
              </TabsTrigger>
            </TabsList>
            <Button onClick={fetchLeads} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* График по городам */}
              <Card>
                <CardHeader>
                  <CardTitle>Топ-5 городов</CardTitle>
                  <CardDescription>Города с наибольшим количеством лидов</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* График по автомобилям */}
              <Card>
                <CardHeader>
                  <CardTitle>Популярные модели</CardTitle>
                  <CardDescription>Выбранные автомобили</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={carData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {carData.map((entry, index) => {
                          const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* График по источникам */}
              <Card>
                <CardHeader>
                  <CardTitle>Источники трафика</CardTitle>
                  <CardDescription>Распределение лидов по каналам</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.default} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* График по качеству */}
              <Card>
                <CardHeader>
                  <CardTitle>Качество лидов</CardTitle>
                  <CardDescription>Распределение по уровням качества</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={qualityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name.split(' ')[0]}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {qualityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* График по способам покупки */}
              <Card>
                <CardHeader>
                  <CardTitle>Способы покупки</CardTitle>
                  <CardDescription>Распределение по методам оплаты</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={paymentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* График по дням */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Динамика по дням</CardTitle>
                  <CardDescription>Количество лидов за последние 7 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#ef4444" fill="#fee2e2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Table Tab */}
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Все лиды</CardTitle>
                <CardDescription>
                  Полный список лидов с автоматическим обновлением каждую минуту
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
                            <TableCell>
                              <Badge variant="outline">{lead.purchaseMethod}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary"
                                style={{ 
                                  backgroundColor: `${COLORS[lead.trafficSource as keyof typeof COLORS] || COLORS.default}20`,
                                  color: COLORS[lead.trafficSource as keyof typeof COLORS] || COLORS.default
                                }}
                              >
                                {lead.trafficSource}
                              </Badge>
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
