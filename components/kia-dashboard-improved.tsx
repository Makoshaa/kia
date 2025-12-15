"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context-new'
import { LogOut, RefreshCw, TrendingUp, Users, Target, Activity, BarChart3, PieChart as PieChartIcon, Calendar, ArrowUpRight, Clock, MapPin, Car, CreditCard, MessageSquare } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts'

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

const QUALITY_COLORS = ['#ef4444', '#f59e0b', '#10b981']

// Кастомный компонент для Tooltip графиков
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            Количество: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function KiaDashboard() {
  const { logout, user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Фильтры для таблицы
  const [searchQuery, setSearchQuery] = useState('')
  const [qualityFilter, setQualityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  
  // Время последнего обновления
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
        setLastUpdateTime(new Date())
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

  const stats = useMemo(() => {
    const total = leads.length
    const highQuality = leads.filter(lead => lead.clientQuality >= 70).length
    const mediumQuality = leads.filter(lead => lead.clientQuality >= 40 && lead.clientQuality < 70).length
    const lowQuality = leads.filter(lead => lead.clientQuality < 40).length
    const conversion = total > 0 ? Math.round((highQuality / total) * 100) : 0
    const lastLead = leads.length > 0 ? leads[0] : null

    return { total, highQuality, mediumQuality, lowQuality, conversion, lastLead }
  }, [leads])

  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {}
    leads.forEach(lead => {
      sources[lead.trafficSource] = (sources[lead.trafficSource] || 0) + 1
    })
    return Object.entries(sources).map(([name, value]) => ({ name, value }))
  }, [leads])

  const qualityData = useMemo(() => [
    { name: 'Высокое', value: stats.highQuality, fill: '#10b981' },
    { name: 'Среднее', value: stats.mediumQuality, fill: '#f59e0b' },
    { name: 'Низкое', value: stats.lowQuality, fill: '#ef4444' },
  ], [stats])

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

  const carData = useMemo(() => {
    const cars: Record<string, number> = {}
    leads.forEach(lead => {
      cars[lead.selectedCar] = (cars[lead.selectedCar] || 0) + 1
    })
    return Object.entries(cars)
      .map(([name, value]) => ({ 
        name, 
        value,
        fill: `hsl(${Math.random() * 360}, 70%, 60%)`
      }))
      .sort((a, b) => b.value - a.value)
  }, [leads])

  const paymentData = useMemo(() => {
    const methods: Record<string, number> = {}
    leads.forEach(lead => {
      methods[lead.purchaseMethod] = (methods[lead.purchaseMethod] || 0) + 1
    })
    const total = leads.length
    return Object.entries(methods).map(([name, value]) => ({ 
      name, 
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      fill: name === 'кредит' ? '#3b82f6' : name === 'наличные' ? '#10b981' : '#f59e0b'
    }))
  }, [leads])

  // Фильтрация лидов
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Поиск по имени, городу, автомобилю
      const matchesSearch = searchQuery === '' || 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.selectedCar?.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Фильтр по качеству
      const matchesQuality = qualityFilter === 'all' || 
        (qualityFilter === 'high' && lead.clientQuality >= 70) ||
        (qualityFilter === 'medium' && lead.clientQuality >= 40 && lead.clientQuality < 70) ||
        (qualityFilter === 'low' && lead.clientQuality < 40)
      
      // Фильтр по источнику
      const matchesSource = sourceFilter === 'all' || lead.trafficSource === sourceFilter
      
      // Фильтр по дате
      const now = new Date()
      const leadDate = new Date(lead.createdAt)
      let matchesDate = true
      
      if (dateFilter === 'all') {
        matchesDate = true
      } else if (dateFilter === 'today') {
        matchesDate = leadDate.toDateString() === now.toDateString()
      } else if (dateFilter === 'week') {
        matchesDate = (now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
      } else if (dateFilter === 'month') {
        matchesDate = (now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24) <= 30
      } else if (dateFilter === 'custom') {
        if (customDateFrom && customDateTo) {
          const fromDate = new Date(customDateFrom)
          const toDate = new Date(customDateTo)
          toDate.setHours(23, 59, 59, 999) // Включаем весь день
          matchesDate = leadDate >= fromDate && leadDate <= toDate
        } else if (customDateFrom) {
          const fromDate = new Date(customDateFrom)
          matchesDate = leadDate >= fromDate
        } else if (customDateTo) {
          const toDate = new Date(customDateTo)
          toDate.setHours(23, 59, 59, 999)
          matchesDate = leadDate <= toDate
        }
      }
      
      return matchesSearch && matchesQuality && matchesSource && matchesDate
    })
  }, [leads, searchQuery, qualityFilter, sourceFilter, dateFilter, customDateFrom, customDateTo])

  // Получаем уникальные источники для фильтра
  const uniqueSources = useMemo(() => {
    return Array.from(new Set(leads.map(lead => lead.trafficSource))).sort()
  }, [leads])

  const dailyData = useMemo(() => {
    const days: Record<string, number> = {}
    const now = new Date()
    let startDate: Date
    let formatPattern: string
    let daysCount: number

    switch (timePeriod) {
      case 'week':
        startDate = subDays(now, 7)
        formatPattern = 'dd.MM'
        daysCount = 7
        break
      case 'month':
        startDate = subDays(now, 30)
        formatPattern = 'dd.MM'
        daysCount = 30
        break
      case 'year':
        startDate = subDays(now, 365)
        formatPattern = 'MMM'
        daysCount = 12
        break
      default:
        startDate = subDays(now, 7)
        formatPattern = 'dd.MM'
        daysCount = 7
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

    const maxCount = Math.max(...data.map(d => d.count), 0)
    const bestDay = data.find(d => d.count === maxCount)

    return { data, maxCount, bestDay }
  }, [leads, timePeriod])

  const openLeadModal = (lead: Lead) => {
    setSelectedLead(lead)
    setIsModalOpen(true)
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 70) return 'bg-green-500 text-white'
    if (quality >= 40) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }

  const getQualityBgColor = (quality: number) => {
    if (quality >= 70) return '#22c55e'
    if (quality >= 40) return '#f97316'
    return '#ef4444'
  }

  const getQualityLabel = (quality: number): string => {
    if (quality >= 70) return 'Высокий'
    if (quality >= 40) return 'Средний'
    return 'Низкий'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kia_logo.png" alt="Kia Logo" className="h-14 w-auto" />
            <div className="h-10 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kia Qazaqstan</h1>
              <p className="text-sm text-gray-500">Панель управления лидами</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdateTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  Обновлено: {format(lastUpdateTime, 'HH:mm', { locale: ru })}
                </span>
              </div>
            )}
            <Button variant="outline" onClick={logout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Updated Stats Cards - Улучшенные */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Всего лидов с разбивкой */}
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle className="text-base font-semibold">Всего лидов</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold mb-3">{stats.total}</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Высокое
                  </span>
                  <span className="font-bold text-lg">{stats.highQuality}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Среднее
                  </span>
                  <span className="font-bold text-lg">{stats.mediumQuality}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Низкое
                  </span>
                  <span className="font-bold text-lg">{stats.lowQuality}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Конверсия */}
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle className="text-base font-semibold">Конверсия</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold mb-2">{stats.conversion}%</div>
              <p className="text-base text-muted-foreground mb-3">
                {stats.highQuality} из {stats.total}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.conversion}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Последний лид */}
          <Card 
            className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => stats.lastLead && openLeadModal(stats.lastLead)}
          >
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle className="text-base font-semibold">Последний лид</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              {stats.lastLead ? (
                <>
                  <div className="text-xl font-bold mb-1 truncate">{stats.lastLead.name}</div>
                  <p className="text-base text-muted-foreground mb-2">
                    {format(new Date(stats.lastLead.createdAt), 'dd.MM.yyyy, HH:mm', { locale: ru })}
                  </p>
                  <div className={`inline-flex items-center justify-center rounded-md text-base font-semibold px-2.5 py-1 ${getQualityColor(stats.lastLead.clientQuality)}`}>
                    {stats.lastLead.clientQuality}%
                  </div>
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                    Подробнее <ArrowUpRight className="h-4 w-4" />
                  </p>
                </>
              ) : (
                <p className="text-base text-muted-foreground">Нет данных</p>
              )}
            </CardContent>
          </Card>

          {/* Ключевые метрики */}
          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <CardTitle className="text-base font-semibold">Метрики периода</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Макс. лидов за 1 день</p>
                  <p className="text-3xl font-bold">{dailyData.maxCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Лучший день</p>
                  <p className="text-xl font-bold">
                    {dailyData.bestDay ? (() => {
                      // Находим дату с максимальным количеством лидов
                      const maxLead = leads.reduce((max, lead) => {
                        const leadDate = new Date(lead.createdAt)
                        const dayKey = format(leadDate, 'dd.MM', { locale: ru })
                        if (dayKey === dailyData.bestDay?.date) {
                          return leadDate
                        }
                        return max
                      }, null as Date | null)
                      return maxLead ? format(maxLead, 'dd.MM.yy', { locale: ru }) : dailyData.bestDay.date
                    })() : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs with Charts and Table */}
        <Tabs defaultValue="overview" className="space-y-6">
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
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
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
                      <Tooltip content={<CustomTooltip />} />
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
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* График по качеству - Компактный вид */}
              <Card>
                <CardHeader>
                  <CardTitle>Качество лидов</CardTitle>
                  <CardDescription>Распределение по уровням качества</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Высокое качество</p>
                        <p className="text-2xl font-bold text-green-700">{stats.highQuality}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">≥ 70%</p>
                        <p className="text-xl font-semibold text-green-600">
                          {stats.total > 0 ? Math.round((stats.highQuality / stats.total) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Среднее качество</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats.mediumQuality}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">40-69%</p>
                        <p className="text-xl font-semibold text-yellow-600">
                          {stats.total > 0 ? Math.round((stats.mediumQuality / stats.total) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Низкое качество</p>
                        <p className="text-2xl font-bold text-red-700">{stats.lowQuality}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">&lt; 40%</p>
                        <p className="text-xl font-semibold text-red-600">
                          {stats.total > 0 ? Math.round((stats.lowQuality / stats.total) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* График по способам покупки - Progress bars */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Способы покупки</CardTitle>
                  <CardDescription>Распределение по методам оплаты</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentData.map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{item.name}</span>
                          <span className="text-sm font-bold">{item.value} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: item.fill
                            }}
                          >
                            {item.percentage > 10 && (
                              <span className="text-xs text-white font-semibold">{item.percentage}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* График динамики с фильтрами */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Динамика по дням</CardTitle>
                      <CardDescription>Количество лидов за выбранный период</CardDescription>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="week" 
                          checked={timePeriod === 'week'}
                          onCheckedChange={() => setTimePeriod('week')}
                        />
                        <Label htmlFor="week" className="cursor-pointer text-sm">Неделя</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="month" 
                          checked={timePeriod === 'month'}
                          onCheckedChange={() => setTimePeriod('month')}
                        />
                        <Label htmlFor="month" className="cursor-pointer text-sm">Месяц</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="year" 
                          checked={timePeriod === 'year'}
                          onCheckedChange={() => setTimePeriod('year')}
                        />
                        <Label htmlFor="year" className="cursor-pointer text-sm">Год</Label>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyData.data}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                      />
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
                <CardTitle>Все лиды ({filteredLeads.length})</CardTitle>
                <CardDescription>
                  Полный список лидов с автоматическим обновлением каждую минуту
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Фильтры */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-wrap gap-4">
                    {/* Поиск */}
                    <div className="flex-1 min-w-[250px]">
                      <Input
                        placeholder="Поиск по имени, городу, автомобилю..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Фильтр по качеству */}
                    <Select value={qualityFilter} onValueChange={(value: any) => setQualityFilter(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Качество" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все качества</SelectItem>
                        <SelectItem value="high">Высокое (≥70%)</SelectItem>
                        <SelectItem value="medium">Среднее (40-69%)</SelectItem>
                        <SelectItem value="low">Низкое (&lt;40%)</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Фильтр по источнику */}
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Источник" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все источники</SelectItem>
                        {uniqueSources.map(source => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Фильтр по дате */}
                    <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Период" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Весь период</SelectItem>
                        <SelectItem value="today">Сегодня</SelectItem>
                        <SelectItem value="week">За неделю</SelectItem>
                        <SelectItem value="month">За месяц</SelectItem>
                        <SelectItem value="custom">Свой период</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Кастомный период */}
                  {dateFilter === 'custom' && (
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="dateFrom" className="text-sm">С:</Label>
                        <Input
                          id="dateFrom"
                          type="date"
                          value={customDateFrom}
                          onChange={(e) => setCustomDateFrom(e.target.value)}
                          className="w-[160px]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="dateTo" className="text-sm">По:</Label>
                        <Input
                          id="dateTo"
                          type="date"
                          value={customDateTo}
                          onChange={(e) => setCustomDateTo(e.target.value)}
                          className="w-[160px]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">

                    {/* Кнопка сброса фильтров */}
                    {(searchQuery || qualityFilter !== 'all' || sourceFilter !== 'all' || dateFilter !== 'all' || customDateFrom || customDateTo) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery('')
                          setQualityFilter('all')
                          setSourceFilter('all')
                          setDateFilter('all')
                          setCustomDateFrom('')
                          setCustomDateTo('')
                        }}
                      >
                        Сбросить фильтры
                      </Button>
                    )}
                  </div>
                </div>

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
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            Загрузка...
                          </TableCell>
                        </TableRow>
                      ) : filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {searchQuery || qualityFilter !== 'all' || sourceFilter !== 'all' || dateFilter !== 'all' 
                              ? 'Нет лидов, соответствующих фильтрам' 
                              : 'Лидов пока нет'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeads.map((lead) => (
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
                              <Badge 
                                className="text-white font-medium"
                                style={{ 
                                  backgroundColor: getQualityBgColor(lead.clientQuality)
                                }}
                              >
                                {getQualityLabel(lead.clientQuality)} ({lead.clientQuality}%)
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openLeadModal(lead)}
                              >
                                Подробнее
                              </Button>
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

      {/* Lead Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Детали лида</DialogTitle>
            <DialogDescription>
              Полная информация о клиенте
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <h3 className="text-xl font-bold">{selectedLead.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(selectedLead.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>

              {/* Информация о клиенте */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Город</p>
                    <p className="font-semibold">{selectedLead.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Car className="h-5 w-5 text-red-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Автомобиль</p>
                    <p className="font-semibold">{selectedLead.selectedCar}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Способ покупки</p>
                    <p className="font-semibold capitalize">{selectedLead.purchaseMethod}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Activity className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Источник</p>
                    <p className="font-semibold">{selectedLead.trafficSource}</p>
                  </div>
                </div>
              </div>

              {/* Резюме диалога */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start gap-3 mb-2">
                  <MessageSquare className="h-5 w-5 text-gray-500 mt-1" />
                  <p className="font-semibold">Резюме диалога</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed pl-8">
                  {selectedLead.summaryDialog}
                </p>
              </div>

              {/* Качество лида - визуализация */}
              <div className="p-4 border rounded-lg">
                <p className="font-semibold mb-3">Оценка качества лида</p>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white"
                        style={{
                          backgroundColor: selectedLead.clientQuality >= 70 ? '#10b981' : 
                                         selectedLead.clientQuality >= 40 ? '#f59e0b' : '#ef4444'
                        }}
                      >
                        {getQualityLabel(selectedLead.clientQuality)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block">
                        {selectedLead.clientQuality}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
                    <div 
                      style={{ 
                        width: `${selectedLead.clientQuality}%`,
                        backgroundColor: selectedLead.clientQuality >= 70 ? '#10b981' : 
                                       selectedLead.clientQuality >= 40 ? '#f59e0b' : '#ef4444'
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
