"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Target,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  RefreshCw,
} from "@/lib/icons"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Lead {
  id: string
  имя: string
  номер: string
  резюме: string
  "выбранный автомобиль": string
  качество: "низкий" | "средний" | "высокий"
  дата: string
  [key: string]: any
}

interface DashboardData {
  leads: Lead[]
  totalLeads: number
  lowQuality: number
  mediumQuality: number
  highQuality: number
  highPotentialConversion: number
  conversion: number
  lastLead: string
  bestDay: string
  avgLeadsPerDay: number
  maxLeadsInOneDay: number
}

interface DashboardViewerProps {
  endpoint?: string
  title?: string
  showConnectionForm?: boolean
  autoRefresh?: boolean
  additionalColumns?: {
    leadSource: boolean
    leadCategories: boolean
  }
}

const COLORS = {
  низкий: "hsl(0, 84%, 60%)",      // Красный
  средний: "hsl(24, 95%, 53%)",    // Оранжевый
  высокий: "hsl(142, 76%, 36%)",   // Зеленый
}

const getQualityRowColor = (quality: string) => {
  switch (quality) {
    case "высокий":
      return "bg-green-50 hover:bg-green-100 border-l-4 border-l-green-600"
    case "средний":
      return "bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-600"
    case "низкий":
      return "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-600"
    default:
      return "hover:bg-muted/50"
  }
}

const getQualityBadgeColor = (quality: string) => {
  switch (quality) {
    case "высокий":
      return "bg-green-500 text-white hover:bg-green-600 border-green-600"
    case "средний":
      return "bg-orange-500 text-white hover:bg-orange-600 border-orange-600"
    case "низкий":
      return "bg-red-500 text-white hover:bg-red-600 border-red-600"
    default:
      return "bg-gray-500 text-white"
  }
}

export function DashboardViewer({ endpoint: propEndpoint, title = "Панель управления лидами", showConnectionForm = true, autoRefresh = false, additionalColumns }: DashboardViewerProps) {
  const [endpoint, setEndpoint] = useState(propEndpoint || "")
  const [sheetsUrl, setSheetsUrl] = useState("")
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Determine which cards to show based on additional columns settings
  const shouldShowLeadSource = additionalColumns?.leadSource ?? false
  const shouldShowLeadCategories = additionalColumns?.leadCategories ?? false
  const shouldShowQualityDistribution = true // Always show quality distribution

  // Calculate grid columns based on number of visible cards
  const visibleCardsCount = [shouldShowQualityDistribution, shouldShowLeadCategories, shouldShowLeadSource].filter(Boolean).length
  const gridCols = visibleCardsCount === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"
  const [searchTerm, setSearchTerm] = useState("")
  const [qualityFilter, setQualityFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from: string; to: string }>({ from: "", to: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [newLeadsAlert, setNewLeadsAlert] = useState<string>("")
  const previousLeadsCount = useRef<number>(0)
  const previousLeadsRef = useRef<Lead[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [leadStatsTimePeriod, setLeadStatsTimePeriod] = useState<"week" | "month" | "year">("week")

  // Auto-fetch if endpoint is provided
  useEffect(() => {
    if (propEndpoint) {
      fetchData()
    }
  }, [propEndpoint])

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh && propEndpoint) {
      // Set up auto-refresh every 30 seconds
      intervalRef.current = setInterval(() => {
        fetchData()
      }, 30000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [autoRefresh, propEndpoint])

  const formatDateFromTimestamp = (timestamp: string) => {
    try {
      if (!timestamp || timestamp === "" || timestamp === "undefined" || timestamp === "null") {
        return "Не указана"
      }
      const date = new Date(timestamp)
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("ru-RU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
      return timestamp && timestamp.length > 0 ? timestamp : "Не указана"
    } catch (error) {
      return timestamp && timestamp.length > 0 ? timestamp : "Не указана"
    }
  }

  const formatDateOnly = (timestamp: string) => {
    try {
      if (!timestamp || timestamp === "" || timestamp === "undefined" || timestamp === "null") {
        return "Не указана"
      }
      const date = new Date(timestamp)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      }
      return timestamp && timestamp.length > 0 ? timestamp : "Не указана"
    } catch (error) {
      return timestamp && timestamp.length > 0 ? timestamp : "Не указана"
    }
  }

  const fetchData = async () => {
    const url = propEndpoint || endpoint || (sheetsUrl ? `/api/sheets?url=${encodeURIComponent(sheetsUrl)}` : "")
    if (!url) {
      setError("Пожалуйста, введите URL endpoint или ссылку Google Sheets")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log('Fetching data from URL:', url)
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        // Do not set incorrect headers when fetching arbitrary endpoints
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const jsonData = await response.json()
      
      // Debug logging to see the actual data structure
      console.log('Raw API response:', jsonData)
      
      let leads: Lead[] = []
      
      if (Array.isArray(jsonData)) {
        leads = jsonData
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        leads = jsonData.data
      } else if (jsonData.leads && Array.isArray(jsonData.leads)) {
        leads = jsonData.leads
      }
      
      console.log('Extracted leads:', leads)
      console.log('First lead sample:', leads[0])
      if (leads[0]) {
        console.log('Available fields in first lead:', Object.keys(leads[0]))
      }

      const processedLeads = leads.map((lead, index) => {
        const processedLead = { ...lead }
        
        if (!processedLead.id) {
          processedLead.id = (index + 1).toString()
        }

        // Map name fields - prioritize common field names
        if (!processedLead.имя) {
          const nameFields = [
            "client_name", "имя", "name", "клиент", "client", "фио", "fio", 
            "полное_имя", "full_name", "Имя", "Name", "Client Name", "Клиент"
          ]
          const nameField = nameFields.find((field) => processedLead[field] && processedLead[field].toString().trim())
          if (nameField) {
            processedLead.имя = processedLead[nameField].toString().trim()
          }
        }

        // Map phone fields - more comprehensive approach
        if (!processedLead.номер) {
          const phoneFields = [
            "phone", "номер", "телефон", "telephone", "номер_телефона", "phone_number", "tel",
            "телефон_клиента", "client_phone", "контактный_телефон", "contact_phone",
            "мобильный", "mobile", "сотовый", "cell", "моб_телефон", "mob_phone",
            "Phone", "Номер", "Телефон", "Phone Number", "Номер телефона"
          ]
          const phoneField = phoneFields.find((field) => processedLead[field] && processedLead[field].toString().trim())
          if (phoneField) {
            processedLead.номер = processedLead[phoneField].toString().trim()
          }
        }

        // Map resume/description fields
        if (!processedLead.резюме) {
          const resumeFields = [
            "summary", "резюме", "resume", "description", "комментарий", "comment", 
            "описание", "notes", "заметки", "Summary", "Резюме", "Description", 
            "Комментарий", "Comment", "Описание", "Резюме диалога", "Dialog Summary"
          ]
          const resumeField = resumeFields.find((field) => processedLead[field] && processedLead[field].toString().trim())
          if (resumeField) {
            processedLead.резюме = processedLead[resumeField].toString().trim()
          }
        }

        // Map generic category (not only cars)
        if (!processedLead["категория"]) {
          const categoryFields = [
            // Generic
            "категория", "category", "группа", "group", "тип", "type", "направление", "direction",
            // Product/Service
            "товар", "product", "услуга", "service", "продукт", "offer",
            // Cars (legacy)
            "selected_car", "выбранный автомобиль", "автомобиль", "car", "машина", "vehicle", "модель", "model", "выбор", "choice",
            // Variations / capitalized
            "Category", "Категория", "Product", "Service", "Тип", "Type"
          ]
          const categoryField = categoryFields.find((field) => processedLead[field] && processedLead[field].toString().trim())
          if (categoryField) {
            processedLead["категория"] = processedLead[categoryField].toString().trim()
          }
        }
        // Backward compatibility: if only car-specific field exists, mirror it into категория
        if (!processedLead["категория"] && processedLead["выбранный автомобиль"]) {
          processedLead["категория"] = String(processedLead["выбранный автомобиль"]).trim()
        }

        // Map lead source fields
        if (!processedLead["источник"]) {
          const sourceFields = [
            "source", "источник", "lead_source", "источник_лида", "канал", "channel",
            "utm_source", "referrer", "referral", "откуда", "откуда_узнал",
            "Source", "Источник", "Lead Source", "Источник лида", "Канал", "Channel",
            "UTM Source", "Referrer", "Referral", "Откуда", "Откуда узнал"
          ]
          const sourceField = sourceFields.find((field) => processedLead[field] && processedLead[field].toString().trim())
          if (sourceField) {
            processedLead["источник"] = processedLead[sourceField].toString().trim()
          }
        }

        // Process quality field with better logic
        if (!processedLead.качество) {
          const qualityFields = [
            "lead_quality", "качество", "quality", "grade", "статус", "status", 
            "приоритет", "priority", "Lead Quality", "Качество", "Quality", 
            "Grade", "Статус", "Status", "Приоритет", "Priority",
            "качество_лида", "lead_grade", "quality_level", "уровень_качества",
            "Качество лида", "Lead Grade", "Quality Level", "Уровень качества"
          ]
          const qualityField = qualityFields.find((field) => processedLead[field] && processedLead[field].toString().trim())
          if (qualityField) {
            let qualityValue = String(processedLead[qualityField]).toLowerCase().trim()
            console.log(`Found quality field "${qualityField}" with value: "${qualityValue}"`)
            
            if (
              qualityValue === "высокий" ||
              qualityValue === "high" ||
              qualityValue === "отличный" ||
              qualityValue === "excellent" ||
              qualityValue === "высокое" ||
              qualityValue === "высокого" ||
              qualityValue === "высокая" ||
              qualityValue === "высокое качество" ||
              qualityValue === "high quality"
            ) {
              processedLead.качество = "высокий"
            } else if (
              qualityValue === "хороший" ||
              qualityValue === "good" ||
              qualityValue === "хорошее" ||
              qualityValue === "хорошего" ||
              qualityValue === "хорошая" ||
              qualityValue === "хорошее качество" ||
              qualityValue === "good quality"
            ) {
              // Map "хороший" to "высокий" since we removed the good quality level
              processedLead.качество = "высокий"
            } else if (
              qualityValue === "средний" ||
              qualityValue === "medium" ||
              qualityValue === "average" ||
              qualityValue === "нормальный" ||
              qualityValue === "среднее" ||
              qualityValue === "среднего" ||
              qualityValue === "средняя" ||
              qualityValue === "среднее качество" ||
              qualityValue === "medium quality"
            ) {
              processedLead.качество = "средний"
            } else if (
              qualityValue === "низкий" ||
              qualityValue === "low" ||
              qualityValue === "bad" ||
              qualityValue === "плохой" ||
              qualityValue === "низкое" ||
              qualityValue === "низкого" ||
              qualityValue === "низкая" ||
              qualityValue === "низкое качество" ||
              qualityValue === "low quality"
            ) {
              processedLead.качество = "низкий"
            } else {
              // If quality value doesn't match known values, set to "средний" as default
              console.warn(`Unknown quality value: "${qualityValue}" for lead ${processedLead.id || index}. Setting to "средний".`)
              processedLead.качество = "средний"
            }
          } else {
            // If no quality field found, set to "средний" as default
            console.warn(`No quality field found for lead ${processedLead.id || index}. Available fields:`, Object.keys(processedLead))
            processedLead.качество = "средний"
          }
        } else {
          // Process existing quality value
          const qualityValue = String(processedLead.качество).toLowerCase().trim()
          console.log(`Processing existing quality value: "${qualityValue}"`)
          
          if (
            qualityValue === "высокий" ||
            qualityValue === "high" ||
            qualityValue === "отличный" ||
            qualityValue === "excellent" ||
            qualityValue === "высокое" ||
            qualityValue === "высокого" ||
            qualityValue === "высокая" ||
            qualityValue === "высокое качество" ||
            qualityValue === "high quality"
          ) {
            processedLead.качество = "высокий"
          } else if (
            qualityValue === "хороший" ||
            qualityValue === "good" ||
            qualityValue === "хорошее" ||
            qualityValue === "хорошего" ||
            qualityValue === "хорошая" ||
            qualityValue === "хорошее качество" ||
            qualityValue === "good quality"
          ) {
            // Map "хороший" to "высокий" since we removed the good quality level
            processedLead.качество = "высокий"
          } else if (
            qualityValue === "средний" ||
            qualityValue === "medium" ||
            qualityValue === "average" ||
            qualityValue === "нормальный" ||
            qualityValue === "среднее" ||
            qualityValue === "среднего" ||
            qualityValue === "средняя" ||
            qualityValue === "среднее качество" ||
            qualityValue === "medium quality"
          ) {
            processedLead.качество = "средний"
          } else if (
            qualityValue === "низкий" ||
            qualityValue === "low" ||
            qualityValue === "bad" ||
            qualityValue === "плохой" ||
            qualityValue === "низкое" ||
            qualityValue === "низкого" ||
            qualityValue === "низкая" ||
            qualityValue === "низкое качество" ||
            qualityValue === "low quality"
          ) {
            processedLead.качество = "низкий"
          } else {
            // If quality value doesn't match known values, set to "средний" as default
            console.warn(`Unknown existing quality value: "${qualityValue}" for lead ${processedLead.id || index}. Setting to "средний".`)
            processedLead.качество = "средний"
          }
        }

        // Ensure date is properly formatted
        if (!processedLead.дата) {
          const dateFields = ["timestamp", "дата", "date", "время", "time", "created", "Дата", "Date", "TIME", "Timestamp"]
          const dateField = dateFields.find((field) => processedLead[field])
          if (dateField) {
            processedLead.дата = processedLead[dateField]
          } else {
            processedLead.дата = new Date().toISOString()
          }
        }

        return processedLead
      })


      const processedData: DashboardData = {
        leads: processedLeads,
        totalLeads: processedLeads.length,
        lowQuality: processedLeads.filter((lead) => lead.качество === "низкий").length,
        mediumQuality: processedLeads.filter((lead) => lead.качество === "средний").length,
        highQuality: processedLeads.filter((lead) => lead.качество === "высокий").length,
        highPotentialConversion: processedLeads.length > 0 
          ? Math.round((processedLeads.filter((lead) => lead.качество === "высокий").length / processedLeads.length) * 100)
          : 0,
        // Use only high quality for conversion calculation
        conversion: (() => {
          if (processedLeads.length === 0) return 0
          const high = processedLeads.filter((lead) => lead.качество === "высокий").length
          const denominator = processedLeads.length
          return Math.round((high / denominator) * 100)
        })(),
        lastLead: processedLeads.length > 0 
          ? formatDateFromTimestamp(
              processedLeads.reduce((latest, lead) => {
                const leadDate = new Date(lead.дата).getTime()
                const latestDate = new Date(latest.дата).getTime()
                return leadDate > latestDate ? lead : latest
              }).дата,
            )
          : "Нет данных",
        bestDay: processedLeads.length > 0
          ? (() => {
              const dailyCounts = processedLeads.reduce(
                (acc, lead) => {
                  const date = formatDateOnly(lead.дата)
                  const existing = acc.find((item) => item.date === date)
                  if (existing) {
                    existing.count += 1
                  } else {
                    acc.push({ date, count: 1 })
                  }
                  return acc
                },
                [] as { date: string; count: number }[],
              )
              return dailyCounts.reduce((max, day) => (day.count > max.count ? day : max)).date
            })()
          : "Нет данных",
        avgLeadsPerDay: processedLeads.length > 0
          ? Math.round(
              processedLeads.length /
                Math.max(
                  processedLeads.reduce(
                    (acc, lead) => {
                      const date = formatDateOnly(lead.дата)
                      const existing = acc.find((item) => item.date === date)
                      if (existing) {
                        existing.count += 1
                      } else {
                        acc.push({ date, count: 1 })
                      }
                      return acc
                    },
                    [] as { date: string; count: number }[],
                  ).length,
                  1,
                ),
            )
          : 0,
        maxLeadsInOneDay: processedLeads.length > 0
          ? (() => {
              const dailyCounts = processedLeads.reduce(
                (acc, lead) => {
                  const date = formatDateOnly(lead.дата)
                  const existing = acc.find((item) => item.date === date)
                  if (existing) {
                    existing.count += 1
                  } else {
                    acc.push({ date, count: 1 })
                  }
                  return acc
                },
                [] as { date: string; count: number }[],
              )
              return dailyCounts.reduce((max, day) => (day.count > max.count ? day : max)).count
            })()
          : 0
      }

      setData(processedData)
    } catch (err) {
      setError(`Ошибка загрузки данных: ${err instanceof Error ? err.message : "Неизвестная ошибка"}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = data?.leads.filter((lead) => {
    const name = lead.имя || lead.name || lead.client_name || lead.клиент || lead.client || lead.фио || lead.fio || lead.полное_имя || lead.full_name || ""
    const phone = lead.номер || lead.phone || lead.телефон || lead.telephone || lead.номер_телефона || lead.phone_number || lead.tel || ""
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(phone).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesQuality = qualityFilter === "all" || lead.качество === qualityFilter
    return matchesSearch && matchesQuality
  }) || []

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex)

  const getLatestLead = () => {
    if (!data?.leads || data.leads.length === 0) return null

    return data.leads.reduce((latest, lead) => {
      const leadDate = new Date(lead.дата || lead.timestamp || lead.Дата || lead.Date || new Date()).getTime()
      const latestDate = new Date(latest.дата || latest.timestamp || latest.Дата || latest.Date || new Date()).getTime()
      return leadDate > latestDate ? lead : latest
    })
  }

  const latestLead = getLatestLead()

  const chartData = useMemo(() => {
    if (!data?.leads?.length)
      return {
        categoryData: [],
        leadStatsData: [],
        sourceData: [],
      }

    // Category data
    const categoryData = data.leads
      .reduce(
        (acc, lead) => {
          // Generic category detection (not limited to cars)
          const category = lead["категория"] ||
                          lead.category ||
                          lead["категория товара"] ||
                          lead["товар"] ||
                          lead.product ||
                          lead.service ||
                          lead["услуга"] ||
                          lead.group || lead["группа"] ||
                          lead.type || lead["тип"] ||
                          // Fallback to car-related legacy fields
                          lead["выбранный автомобиль"] || 
                          lead.selected_car || 
                          lead.автомобиль || 
                          lead.car || 
                          lead.машина || 
                          lead.vehicle || 
                          lead.модель || 
                          lead.model || 
                          lead.выбор || 
                          lead.choice || 
                          "Без категории"
          
          // Clean up the category name (remove extra spaces, handle empty strings)
          const cleanCategory = category && category.trim() !== "" ? category.trim() : "Без категории"
          
          const existing = acc.find((item) => item.category === cleanCategory)
          if (existing) {
            existing.count += 1
          } else {
            acc.push({ category: cleanCategory, count: 1 })
          }
          return acc
        },
        [] as { category: string; count: number }[],
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Debug logging for category data
    console.log("Category data:", categoryData)
    console.log("Sample leads for category analysis:", data.leads.slice(0, 3).map(lead => ({
      id: lead.id,
      carFields: {
        "выбранный автомобиль": lead["выбранный автомобиль"],
        selected_car: lead.selected_car,
        автомобиль: lead.автомобиль,
        car: lead.car,
        машина: lead.машина,
        vehicle: lead.vehicle,
        модель: lead.модель,
        model: lead.model,
        выбор: lead.выбор,
        choice: lead.choice
      }
    })))

    // Lead statistics data with time filtering
    const now = new Date()
    const daysToFilter = leadStatsTimePeriod === "week" ? 7 : leadStatsTimePeriod === "month" ? 30 : 365
    const startDate = new Date(now.getTime() - (daysToFilter - 1) * 24 * 60 * 60 * 1000)
    startDate.setHours(0, 0, 0, 0)

    const filteredLeads = data.leads.filter((lead) => {
      const leadDate = new Date(lead.дата)
      leadDate.setHours(0, 0, 0, 0)
      return leadDate >= startDate
    })

    const allDays = []
    for (let i = 0; i < daysToFilter; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      allDays.push(formatDateOnly(date.toISOString()))
    }
    allDays.reverse()

    const leadStatsData = allDays.map(date => ({
      date,
      count: 0,
      high: 0,
      medium: 0,
      low: 0,
    }))

    filteredLeads.forEach((lead) => {
      const date = formatDateOnly(lead.дата)
      const existing = leadStatsData.find((item) => item.date === date)
      if (existing) {
        existing.count += 1
        const quality = lead.качество || "неизвестно"
        if (quality === "высокий") existing.high += 1
        else if (quality === "средний") existing.medium += 1
        else existing.low += 1
      }
    })

    // Lead source data
    const sourceData = data.leads
      .reduce(
        (acc, lead) => {
          const source = lead["источник"] ||
                        lead.source ||
                        lead.lead_source ||
                        lead["источник_лида"] ||
                        lead.канал ||
                        lead.channel ||
                        lead.utm_source ||
                        lead.referrer ||
                        lead.referral ||
                        lead.откуда ||
                        lead["откуда_узнал"] ||
                        "Не указан"
          
          // Clean up the source name
          const cleanSource = source && source.trim() !== "" ? source.trim() : "Не указан"
          
          const existing = acc.find((item) => item.source === cleanSource)
          if (existing) {
            existing.count += 1
          } else {
            acc.push({ source: cleanSource, count: 1 })
          }
          return acc
        },
        [] as { source: string; count: number }[],
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return { categoryData, leadStatsData, sourceData }
  }, [data?.leads, leadStatsTimePeriod])

  // Available qualities (3 levels: низкий, средний, высокий)
  const availableQualities = useMemo(() => {
    if (!data) return ["низкий", "средний", "высокий"] as const
    const present = new Set<string>()
    for (const lead of data.leads) {
      if (lead.качество) present.add(lead.качество)
    }
    const ordered = ["низкий", "средний", "высокий"].filter(q => present.has(q))
    return ordered.length > 0 ? (ordered as ("низкий" | "средний" | "высокий")[]) : ["низкий", "средний", "высокий"]
  }, [data])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">Отслеживайте и анализируйте ваши лиды в реальном времени</p>
            </div>
            {autoRefresh && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Автообновление активно</span>
              </div>
            )}
          </div>

          {/* Connection Form */}
          {showConnectionForm && (
            <Card>
              <CardHeader>
                <CardTitle>Подключение источника данных</CardTitle>
                <CardDescription>Вставьте ссылку Google Sheets или укажите Google Apps Script endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <Input
                      placeholder="https://docs.google.com/spreadsheets/d/... (общий доступ: любой со ссылкой)"
                      value={sheetsUrl}
                      onChange={(e) => setSheetsUrl(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Input
                      placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec (альтернативный источник)"
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => { void fetchData() }} disabled={loading}>
                      {loading ? "Загрузка..." : "Загрузить"}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </CardContent>
            </Card>
          )}
        </div>

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">
                     Всего лидов
                   </CardTitle>
                   <Users className="h-4 w-4 text-muted-foreground" />
                 </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalLeads}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Низкий: {data.lowQuality} • Средний: {data.mediumQuality} • Высокий: {data.highQuality}
                  </div>
                </CardContent>
              </Card>

               <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">
                     Конверсия
                   </CardTitle>
                   <Target className="h-4 w-4 text-muted-foreground" />
                 </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.conversion}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Высокое качество / Всего лидов</div>
                </CardContent>
              </Card>

               <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">
                     Высокий потенциал
                   </CardTitle>
                   <TrendingUp className="h-4 w-4 text-muted-foreground" />
                 </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.highPotentialConversion}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Только высокое качество / Всего лидов</div>
                </CardContent>
              </Card>

               <Card
                 className="cursor-pointer hover:shadow-md transition-shadow"
                 onClick={() => {
                   if (latestLead) {
                     setSelectedLead(latestLead)
                   }
                 }}
               >
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">
                     Последний лид
                   </CardTitle>
                   <Clock className="h-4 w-4 text-muted-foreground" />
                 </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {latestLead
                      ? latestLead.имя || latestLead.name || latestLead.client_name || latestLead.клиент || latestLead.client || latestLead.фио || latestLead.fio || latestLead.полное_имя || latestLead.full_name || latestLead.номер || latestLead.phone || latestLead.телефон || "Без имени"
                      : "Нет данных"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {latestLead ? formatDateFromTimestamp(latestLead.дата || latestLead.timestamp || latestLead.Дата || latestLead.Date) : "Нет данных"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 opacity-70">Нажмите для подробностей</div>
                </CardContent>
              </Card>

               <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">
                     Качественные лиды
                   </CardTitle>
                   <TrendingUp className="h-4 w-4 text-muted-foreground" />
                 </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.highQuality}</div>
                  <div className="text-xs text-muted-foreground mt-1">Лиды высокого качества</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="leads">Лиды</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
                  {/* Quality Distribution Pie Chart - always shown */}
                  {shouldShowQualityDistribution && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Распределение качества лидов</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Высокое качество", value: data.highQuality, color: "#22c55e" },
                                { name: "Среднее качество", value: data.mediumQuality, color: "#eab308" },
                                { name: "Низкое качество", value: data.lowQuality, color: "#ef4444" },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: "Высокое качество", value: data.highQuality, color: "#22c55e" },
                                { name: "Среднее качество", value: data.mediumQuality, color: "#eab308" },
                                { name: "Низкое качество", value: data.lowQuality, color: "#ef4444" },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Leads by Category - shown when leadCategories is selected */}
                  {shouldShowLeadCategories && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Лиды по категориям</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.categoryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.categoryData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count">
                                {chartData.categoryData.map((entry, index) => {
                                  const colors = [
                                    "#10b981", // Green
                                    "#3b82f6", // Blue
                                    "#f59e0b", // Yellow
                                    "#ef4444", // Red
                                    "#8b5cf6", // Purple
                                    "#06b6d4", // Cyan
                                    "#f97316", // Orange
                                    "#84cc16", // Lime
                                    "#ec4899", // Pink
                                    "#6b7280"  // Gray
                                  ]
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                })}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            <div className="text-center">
                              <p className="text-lg font-medium">Нет данных о категориях</p>
                              <p className="text-sm">Проверьте, что в данных есть информация о категориях</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Leads by Source - shown when leadSource is selected */}
                  {shouldShowLeadSource && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Лиды по источникам</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.sourceData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.sourceData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="source" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count">
                                {chartData.sourceData.map((entry, index) => {
                                  const colors = [
                                    "#3b82f6", // Blue
                                    "#ef4444", // Red
                                    "#10b981", // Green
                                    "#f59e0b", // Yellow
                                    "#8b5cf6", // Purple
                                    "#06b6d4", // Cyan
                                    "#f97316", // Orange
                                    "#84cc16", // Lime
                                    "#ec4899", // Pink
                                    "#6b7280"  // Gray
                                  ]
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                })}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            <div className="text-center">
                              <p className="text-lg font-medium">Нет данных об источниках</p>
                              <p className="text-sm">Проверьте, что в данных есть информация об источниках лидов</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Leads Statistics - Full Width */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Статистика лидов</CardTitle>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="leadStatsTimePeriod"
                          checked={leadStatsTimePeriod === "week"}
                          onChange={() => setLeadStatsTimePeriod("week")}
                          className="w-4 h-4"
                        />
                        Неделя
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="leadStatsTimePeriod"
                          checked={leadStatsTimePeriod === "month"}
                          onChange={() => setLeadStatsTimePeriod("month")}
                          className="w-4 h-4"
                        />
                        Месяц
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="leadStatsTimePeriod"
                          checked={leadStatsTimePeriod === "year"}
                          onChange={() => setLeadStatsTimePeriod("year")}
                          className="w-4 h-4"
                        />
                        Год
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      {leadStatsTimePeriod === "week" &&
                        `Последние 7 дней`}
                      {leadStatsTimePeriod === "month" &&
                        `Последние 30 дней`}
                      {leadStatsTimePeriod === "year" &&
                        `Последние 365 дней`}
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.leadStatsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="high" stackId="quality" fill="#22c55e" name="Высокое качество" />
                        <Bar dataKey="medium" stackId="quality" fill="#f59e0b" name="Среднее качество" />
                        <Bar dataKey="low" stackId="quality" fill="#ef4444" name="Низкое качество" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Статистика качества</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Низкое качество</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${(data.lowQuality / data.totalLeads) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{data.lowQuality}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Среднее качество</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${(data.mediumQuality / data.totalLeads) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{data.mediumQuality}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Высокое качество</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(data.highQuality / data.totalLeads) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{data.highQuality}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ключевые метрики</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Общая конверсия</span>
                        <span className="font-medium">{data.conversion}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Высокий потенциал</span>
                        <span className="font-medium">{data.highPotentialConversion}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Максимум заявок за 1 день</span>
                        <span className="font-medium">{data.maxLeadsInOneDay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Лучший день</span>
                        <span className="font-medium">{data.bestDay}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="leads" className="space-y-6">
                {/* Leads Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Список лидов ({filteredLeads.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 space-y-4">
                      <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Поиск по имени или телефону..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <Select value={qualityFilter} onValueChange={setQualityFilter}>
                          <SelectTrigger className="w-48">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Качество" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все качества</SelectItem>
                            {availableQualities.map((q) => (
                              <SelectItem key={q} value={q}>
                                {q.charAt(0).toUpperCase() + q.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Имя</TableHead>
                            <TableHead>Номер</TableHead>
                            <TableHead>Резюме</TableHead>
                            <TableHead>Категория</TableHead>
                            <TableHead>Источник</TableHead>
                            <TableHead>Качество</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedLeads.map((lead) => (
                            <TableRow
                              key={lead.id}
                              className={`cursor-pointer transition-colors ${getQualityRowColor(lead.качество)}`}
                              onClick={() => setSelectedLead(lead)}
                            >
                              <TableCell className="font-medium">
                                {lead.имя || lead.name || lead.client_name || lead.клиент || lead.client || lead.фио || lead.fio || lead.полное_имя || lead.full_name || "Не указано"}
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const phoneFields = [
                                    "phone", "номер", "телефон", "telephone", "номер_телефона", "phone_number", "tel",
                                    "телефон_клиента", "client_phone", "контактный_телефон", "contact_phone",
                                    "мобильный", "mobile", "сотовый", "cell", "моб_телефон", "mob_phone",
                                    "Phone", "Номер", "Телефон", "Phone Number", "Номер телефона"
                                  ]
                                  const phoneField = phoneFields.find(field => lead[field] && lead[field].toString().trim())
                                  const phoneValue = phoneField ? lead[phoneField].toString().trim() : "Не указан"
                                  return phoneValue
                                })()}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {lead.резюме || lead.resume || lead.description || lead.summary || lead.комментарий || lead.comment || lead.описание || lead.notes || lead.заметки || "Не указано"}
                              </TableCell>
                              <TableCell>{lead["категория"] || lead.category || lead["категория товара"] || lead["товар"] || lead.product || lead.service || lead["услуга"] || lead.group || lead["группа"] || lead.type || lead["тип"] || lead["выбранный автомобиль"] || lead.selected_car || lead.автомобиль || lead.car || lead.машина || lead.vehicle || lead.модель || lead.model || lead.выбор || lead.choice || "Не указан"}</TableCell>
                              <TableCell>{lead["источник"] || lead.source || lead.lead_source || lead["источник_лида"] || lead.канал || lead.channel || lead.utm_source || lead.referrer || lead.referral || lead.откуда || lead["откуда_узнал"] || "Не указан"}</TableCell>
                              <TableCell>
                                <Badge className={`${getQualityBadgeColor(lead.качество)} font-semibold`}>
                                  {lead.качество}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDateOnly(lead.дата)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedLead(lead)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Показано {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} из {filteredLeads.length} лидов
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Назад
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }

                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Вперед
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Lead Details Modal */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Детали лида</DialogTitle>
              <DialogDescription>Подробная информация о выбранном лиде</DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Имя</Label>
                    <p className="text-lg font-medium">
                      {selectedLead.имя || selectedLead.name || selectedLead.client_name || selectedLead.клиент || selectedLead.client || selectedLead.фио || selectedLead.fio || selectedLead.полное_имя || selectedLead.full_name || "Не указано"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Номер телефона</Label>
                    <p className="text-lg">
                      {(() => {
                        const phoneFields = [
                          "phone", "номер", "телефон", "telephone", "номер_телефона", "phone_number", "tel",
                          "телефон_клиента", "client_phone", "контактный_телефон", "contact_phone",
                          "мобильный", "mobile", "сотовый", "cell", "моб_телефон", "mob_phone",
                          "Phone", "Номер", "Телефон", "Phone Number", "Номер телефона"
                        ]
                        const phoneField = phoneFields.find(field => selectedLead[field] && selectedLead[field].toString().trim())
                        return phoneField ? selectedLead[phoneField].toString().trim() : "Не указан"
                      })()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Категория</Label>
                    <p className="text-lg">
                      {selectedLead["категория"] || selectedLead.category || selectedLead["категория товара"] || selectedLead["товар"] || selectedLead.product || selectedLead.service || selectedLead["услуга"] || selectedLead.group || selectedLead["группа"] || selectedLead.type || selectedLead["тип"] || selectedLead["выбранный автомобиль"] || selectedLead.selected_car || selectedLead.автомобиль || selectedLead.car || selectedLead.машина || selectedLead.vehicle || selectedLead.модель || selectedLead.model || selectedLead.выбор || selectedLead.choice || "Не указан"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Источник лида</Label>
                    <p className="text-lg">
                      {selectedLead["источник"] || selectedLead.source || selectedLead.lead_source || selectedLead["источник_лида"] || selectedLead.канал || selectedLead.channel || selectedLead.utm_source || selectedLead.referrer || selectedLead.referral || selectedLead.откуда || selectedLead["откуда_узнал"] || "Не указан"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Качество лида</Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedLead.качество === "высокий"
                            ? "default"
                            : selectedLead.качество === "средний"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-sm"
                      >
                        {selectedLead.качество}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Дата создания</Label>
                    <p className="text-lg">
                      {formatDateOnly(selectedLead.дата)}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Резюме</Label>
                  <p className="text-lg">{selectedLead.резюме || selectedLead.resume || selectedLead.description || selectedLead.summary || selectedLead.комментарий || selectedLead.comment || selectedLead.описание || selectedLead.notes || selectedLead.заметки || "Не указано"}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
