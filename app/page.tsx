"use client"

import { useRef } from "react"

import { useState, useEffect, useMemo } from "react"
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
  качество: "низкий" | "средний" | "хороший" | "высокий"
  дата: string
  [key: string]: any
}

interface DashboardData {
  leads: Lead[]
  totalLeads: number
  lowQuality: number
  mediumQuality: number
  goodQuality: number
  highQuality: number
  highPotentialConversion: number
  conversion: number
  lastLead: string
  bestDay: string
  avgLeadsPerDay: number
  maxLeadsInOneDay: number
}

const COLORS = {
  низкий: "hsl(0, 84%, 60%)", // Red for low quality
  средний: "hsl(45, 93%, 47%)", // Yellow for medium quality
  хороший: "hsl(120, 60%, 50%)", // Light green for good quality
  высокий: "hsl(142, 76%, 36%)", // Dark green for high quality
}

const getQualityRowColor = (quality: string) => {
  switch (quality) {
    case "высокий":
      return "bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500"
    case "хороший":
      return "bg-emerald-50 hover:bg-emerald-100 border-l-4 border-l-emerald-500"
    case "средний":
      return "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-500"
    case "низкий":
      return "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500"
    default:
      return "hover:bg-muted/50"
  }
}

const getQualityBadgeColor = (quality: string) => {
  switch (quality) {
    case "высокий":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "хороший":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
    case "средний":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "низкий":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    default:
      return ""
  }
}

const mockData: Lead[] = [
  {
    id: "1",
    имя: "Иван Петров",
    номер: "+7 (999) 123-45-67",
    резюме: "Ищет надежный автомобиль для семьи",
    "выбранный автомобиль": "Toyota Camry",
    качество: "высокий",
    дата: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    имя: "Мария Сидорова",
    номер: "+7 (999) 234-56-78",
    резюме: "Интересуется экономичными автомобилями",
    "выбранный автомобиль": "Honda Civic",
    качество: "хороший",
    дата: "2024-01-14T14:20:00Z",
  },
  {
    id: "3",
    имя: "Алексей Козлов",
    номер: "+7 (999) 345-67-89",
    резюме: "Готов к покупке премиум автомобиля",
    "выбранный автомобиль": "BMW X5",
    качество: "высокий",
    дата: "2024-01-13T09:15:00Z",
  },
  {
    id: "4",
    имя: "Елена Волкова",
    номер: "+7 (999) 456-78-90",
    резюме: "Рассматривает различные варианты",
    "выбранный автомобиль": "Mercedes C-Class",
    качество: "низкий",
    дата: "2024-01-12T16:45:00Z",
  },
  {
    id: "5",
    имя: "Дмитрий Новиков",
    номер: "+7 (999) 567-89-01",
    резюме: "Нужен автомобиль для работы",
    "выбранный автомобиль": "Audi A4",
    качество: "средний",
    дата: "2024-01-11T11:30:00Z",
  },
  {
    id: "6",
    имя: "Анна Морозова",
    номер: "+7 (999) 678-90-12",
    резюме: "Первый автомобиль, нужна консультация",
    "выбранный автомобиль": "Volkswagen Polo",
    качество: "хороший",
    дата: "2024-01-10T13:20:00Z",
  },
  {
    id: "7",
    имя: "Сергей Иванов",
    номер: "+7 (999) 789-01-23",
    резюме: "Ищет спортивный автомобиль",
    "выбранный автомобиль": "Porsche 911",
    качество: "высокий",
    дата: "2024-01-09T15:30:00Z",
  },
  {
    id: "8",
    имя: "Ольга Петрова",
    номер: "+7 (999) 890-12-34",
    резюме: "Нужен семейный автомобиль",
    "выбранный автомобиль": "Volkswagen Tiguan",
    качество: "средний",
    дата: "2024-01-08T12:15:00Z",
  },
]

export default function Dashboard() {
  const [endpoint, setEndpoint] = useState("")
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [qualityFilter, setQualityFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from: string; to: string }>({ from: "", to: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false)
  const [newLeadsAlert, setNewLeadsAlert] = useState<string>("")
  const previousLeadsCount = useRef<number>(0)
  const previousLeadsRef = useRef<Lead[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [leadStatsTimePeriod, setLeadStatsTimePeriod] = useState<"week" | "month" | "year">("week")

  const formatDateFromTimestamp = (timestamp: string) => {
    try {
      if (!timestamp || timestamp === "" || timestamp === "undefined" || timestamp === "null") {
        return "Не указана"
      }

      // Handle ISO format dates
      const isoMatch = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
      if (isoMatch) {
        const [, year, month, day, hour, minute] = isoMatch
        return `${day}.${month}.${year} ${hour}:${minute}`
      }

      // Handle various date formats
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

      // If it's a string that looks like a date, try to parse it
      if (typeof timestamp === "string" && timestamp.length > 0) {
        // Try different date formats
        const formats = [
          /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})/, // DD.MM.YYYY HH:MM
          /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/, // DD/MM/YYYY HH:MM
          /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/, // YYYY-MM-DD HH:MM
        ]

        for (const format of formats) {
          const match = timestamp.match(format)
          if (match) {
            return timestamp // Return as is if it matches a recognizable format
          }
        }
      }

      return timestamp && timestamp.length > 0 ? timestamp : "Не указана"
    } catch (error) {
      console.log("[v0] Date formatting error:", error, "for timestamp:", timestamp)
      return timestamp && timestamp.length > 0 ? timestamp : "Не указана"
    }
  }

  const formatDateOnly = (timestamp: string) => {
    try {
      if (!timestamp || timestamp === "" || timestamp === "undefined" || timestamp === "null") {
        return "Не указана"
      }

      // Handle ISO format dates
      const isoMatch = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
      if (isoMatch) {
        const [, year, month, day] = isoMatch
        return `${day}.${month}.${year}`
      }

      // Handle various date formats
      const date = new Date(timestamp)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      }

      // If it's a string that looks like a date, extract just the date part
      if (typeof timestamp === "string" && timestamp.length > 0) {
        // Try to extract date part from DD.MM.YYYY HH:MM format
        const dateMatch = timestamp.match(/^(\d{1,2}\.\d{1,2}\.\d{4})/)
        if (dateMatch) {
          return dateMatch[1]
        }
      }

      return timestamp && timestamp.length > 0 ? timestamp : "Не указана"
    } catch (error) {
      console.log("[v0] Date only formatting error:", error, "for timestamp:", timestamp)
      return timestamp && timestamp.length > 0 ? timestamp : "Не указана"
    }
  }

  const formatTableDate = (timestamp: string) => {
    return formatDateOnly(timestamp)
  }

  useEffect(() => {
    if (isAutoRefreshEnabled && endpoint) {
      intervalRef.current = setInterval(() => {
        fetchDataSilently()
      }, 30000) // 30 seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoRefreshEnabled, endpoint])

  useEffect(() => {
    if (data?.leads && previousLeadsRef.current.length > 0) {
      const currentLeadIds = new Set(
        data.leads.map((lead) => lead.id || `${lead.имя || lead.client_name}-${lead.дата || lead.timestamp}`),
      )
      const previousLeadIds = new Set(
        previousLeadsRef.current.map(
          (lead) => lead.id || `${lead.имя || lead.client_name}-${lead.дата || lead.timestamp}`,
        ),
      )

      const newLeads = data.leads.filter((lead) => {
        const leadId = lead.id || `${lead.имя || lead.client_name}-${lead.дата || lead.timestamp}`
        return !previousLeadIds.has(leadId)
      })

      if (newLeads.length > 0) {
        setNewLeadsAlert(`Добавлено ${newLeads.length} новых лидов!`)
        setTimeout(() => setNewLeadsAlert(""), 5000)
      }
    }

    if (data?.leads) {
      previousLeadsRef.current = [...data.leads]
    }
  }, [data?.leads])

  const fetchDataSilently = async () => {
    try {
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()

      const processedLeads: Lead[] = result.map((item: any) => {
        const processedLead: Lead = {
          id: item.id || `${item.имя || item.client_name}-${item.дата || item.timestamp}`,
          имя: item.имя || item.client_name || item.name || "",
          номер: item.номер || item.phone || item.номер_телефона || "",
          резюме: item.резюме || item.resume || item.description || item.summary || item.комментарий || item.comment || "",
          "выбранный автомобиль": item["выбранный автомобиль"] || item.selected_car || item.car || "",
          дата: item.дата || item.timestamp || item.date || new Date().toISOString(),
          статус: item.статус || item.status || "Новый",
          качество: "средний",
        }

        const qualityFields = ["качество", "quality", "lead_quality", "grade"]
        for (const field of qualityFields) {
          if (item[field]) {
            const qualityValue = String(item[field]).toLowerCase()
            if (
              qualityValue === "высокий" ||
              qualityValue === "high" ||
              qualityValue === "отличный"
            ) {
              processedLead.качество = "высокий"
            } else if (
              qualityValue === "хороший" ||
              qualityValue === "good"
            ) {
              processedLead.качество = "хороший"
            } else if (
              qualityValue === "средний" ||
              qualityValue === "medium" ||
              qualityValue === "average" ||
              qualityValue === "нормальный"
            ) {
              processedLead.качество = "средний"
            } else if (
              qualityValue === "низкий" ||
              qualityValue === "low" ||
              qualityValue === "bad" ||
              qualityValue === "плохой"
            ) {
              processedLead.качество = "низкий"
            }
            break
          }
        }

        return processedLead
      })

      const dashboardData = {
        totalLeads: processedLeads.length,
        conversion:
          processedLeads.length > 0
            ? Math.round(
                ((processedLeads.filter((lead) => lead.качество === "высокий").length + 
                  processedLeads.filter((lead) => lead.качество === "хороший").length) / processedLeads.length) * 100,
              )
            : 0,
        highPotentialConversion:
          processedLeads.length > 0
            ? Math.round(
                (processedLeads.filter((lead) => lead.качество === "высокий").length / processedLeads.length) * 100,
              )
            : 0,
        leads: processedLeads,
        lastLead:
          processedLeads.length > 0
            ? formatDateFromTimestamp(
                processedLeads.reduce((latest, lead) => {
                  const leadDate = new Date(lead.дата).getTime()
                  const latestDate = new Date(latest.дата).getTime()
                  return leadDate > latestDate ? lead : latest
                }).дата,
              )
            : "Нет данных",
        bestDay:
          processedLeads.length > 0
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
        avgLeadsPerDay:
          processedLeads.length > 0
            ? Math.round(
                processedLeads.length /
                  Math.max(
                    processedLeads.reduce(
                      (acc, lead) => {
                        const date = formatTableDate(lead.дата)
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
        maxLeadsInOneDay:
          processedLeads.length > 0
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
            : 0,
      }

      const processedData: DashboardData = {
        leads: processedLeads,
        totalLeads: dashboardData.totalLeads,
        lowQuality: processedLeads.filter((lead) => lead.качество === "низкий").length,
        mediumQuality: processedLeads.filter((lead) => lead.качество === "средний").length,
        goodQuality: processedLeads.filter((lead) => lead.качество === "хороший").length,
        highQuality: processedLeads.filter((lead) => lead.качество === "высокий").length,
        highPotentialConversion: dashboardData.highPotentialConversion,
        conversion: dashboardData.conversion,
        lastLead: dashboardData.lastLead,
        bestDay: dashboardData.bestDay,
        avgLeadsPerDay: dashboardData.avgLeadsPerDay,
        maxLeadsInOneDay: dashboardData.maxLeadsInOneDay,
      }

      if (data && processedData.totalLeads > previousLeadsCount.current) {
        const newLeadsCount = processedData.totalLeads - previousLeadsCount.current
        setNewLeadsAlert(`Добавлено ${newLeadsCount} новых лидов!`)
        setTimeout(() => setNewLeadsAlert(""), 5000)
      }

      previousLeadsCount.current = processedData.totalLeads
      setData(processedData)
    } catch (error) {
      console.log("[v0] Silent fetch error:", error)
    }
  }

  const loadMockData = () => {
    const processedData: DashboardData = {
      leads: mockData,
      totalLeads: mockData.length,
      lowQuality: mockData.filter((lead) => lead.качество === "низкий").length,
      mediumQuality: mockData.filter((lead) => lead.качество === "средний").length,
      goodQuality: mockData.filter((lead) => lead.качество === "хороший").length,
      highQuality: mockData.filter((lead) => lead.качество === "высокий").length,
      highPotentialConversion:
        mockData.length > 0
          ? Math.round((mockData.filter((lead) => lead.качество === "высокий").length / mockData.length) * 100)
          : 0,
      conversion:
        mockData.length > 0
          ? Math.round(((mockData.filter((lead) => lead.качество === "высокий").length + 
                        mockData.filter((lead) => lead.качество === "хороший").length) / mockData.length) * 100)
          : 0,
      lastLead:
        mockData.length > 0
          ? new Date(Math.max(...mockData.map((lead) => new Date(lead.дата).getTime()))).toLocaleString("ru-RU")
          : "Нет данных",
      bestDay:
        mockData.length > 0
          ? (() => {
              const dailyCounts = mockData.reduce(
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
      avgLeadsPerDay:
        mockData.length > 0
          ? Math.round(
              mockData.length /
                Math.max(
                  mockData.reduce(
                    (acc, lead) => {
                      const date = formatTableDate(lead.дата)
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
      maxLeadsInOneDay:
        mockData.length > 0
          ? (() => {
              const dailyCounts = mockData.reduce(
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
          : 0,
    }
    setData(processedData)
  }

  const fetchData = async () => {
    if (!endpoint) {
      setError("Пожалуйста, введите URL endpoint")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Attempting to fetch data from:", endpoint)

      const response = await fetch(endpoint, {
        method: "GET",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", response.headers)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const jsonData = await response.json()
      console.log("[v0] Received data:", jsonData)

      let leads: Lead[] = []

      if (Array.isArray(jsonData)) {
        leads = jsonData
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        leads = jsonData.data
      } else if (jsonData.leads && Array.isArray(jsonData.leads)) {
        leads = jsonData.leads
      } else if (jsonData.values && Array.isArray(jsonData.values)) {
        const headers = jsonData.values[0] || []
        leads = jsonData.values.slice(1).map((row: any[], index: number) => {
          const lead: any = { id: (index + 1).toString() }
          headers.forEach((header: string, i: number) => {
            lead[header] = row[i] || ""
          })
          return lead
        })
      } else {
        console.log("[v0] Unknown data structure, trying to extract fields")
        const keys = Object.keys(jsonData)
        const dataKey = keys.find((key) => Array.isArray(jsonData[key]))
        if (dataKey) {
          leads = jsonData[dataKey]
        }
      }

      console.log("[v0] Processed leads:", leads)

      const processedLeads = leads.map((lead, index) => {
        const processedLead = { ...lead }

        if (!processedLead.id) {
          processedLead.id = (index + 1).toString()
        }

        if (!processedLead.резюме) {
          const resumeFields = ["резюме", "resume", "description", "summary", "комментарий", "comment"]
          const resumeField = resumeFields.find((field) => processedLead[field])
          if (resumeField) {
            processedLead.резюме = processedLead[resumeField]
          }
        }

        if (!processedLead.качество) {
          const qualityFields = ["качество", "quality", "статус", "status", "приоритет", "priority", "lead_quality"]
          const qualityField = qualityFields.find((field) => processedLead[field])
          if (qualityField) {
            let qualityValue = processedLead[qualityField]
            if (
              qualityValue === "Высокий" ||
              qualityValue === "High"
            ) {
              qualityValue = "высокий"
            } else if (
              qualityValue === "Хороший" ||
              qualityValue === "Good"
            ) {
              qualityValue = "хороший"
            } else if (qualityValue === "Средний" || qualityValue === "Medium" || qualityValue === "Average") {
              qualityValue = "средний"
            } else if (
              qualityValue === "Плохой" ||
              qualityValue === "Bad" ||
              qualityValue === "Low" ||
              qualityValue === "Низкий"
            ) {
              qualityValue = "низкий"
            }
            processedLead.качество = qualityValue as "низкий" | "средний" | "хороший" | "высокий"
          } else {
            const qualities: ("низкий" | "средний" | "хороший" | "высокий")[] = ["низкий", "средний", "хороший", "высокий"]
            processedLead.качество = qualities[Math.floor(Math.random() * qualities.length)]
          }
        } else {
          const qualityValue = String(processedLead.качество)
          if (
            qualityValue === "Высокий" ||
            qualityValue === "High"
          ) {
            processedLead.качество = "высокий"
          } else if (
            qualityValue === "Хороший" ||
            qualityValue === "Good"
          ) {
            processedLead.качество = "хороший"
          } else if (qualityValue === "Средний" || qualityValue === "Medium" || qualityValue === "Average") {
            processedLead.качество = "средний"
          } else if (
            qualityValue === "Плохой" ||
            qualityValue === "Bad" ||
            qualityValue === "Low" ||
            qualityValue === "Низкий"
          ) {
            processedLead.качество = "низкий"
          }
        }

        if (!processedLead.дата) {
          const dateFields = ["дата", "date", "время", "time", "created", "timestamp"]
          const dateField = dateFields.find((field) => processedLead[field])
          if (dateField) {
            processedLead.дата = processedLead[dateField]
          } else {
            processedLead.дата = new Date().toISOString()
          }
        }

        return processedLead
      })

      console.log("[v0] Quality distribution:", {
        низкий: processedLeads.filter((lead) => lead.качество === "низкий").length,
        средний: processedLeads.filter((lead) => lead.качество === "средний").length,
        хороший: processedLeads.filter((lead) => lead.качество === "хороший").length,
        высокий: processedLeads.filter((lead) => lead.качество === "высокий").length,
        other: processedLeads
          .filter((lead) => !["низкий", "средний", "хороший", "высокий"].includes(lead.качество))
          .map((lead) => lead.качество),
      })

      const qualityDistribution = { низкий: 0, средний: 0, хороший: 0, высокий: 0, other: [] as string[] }
      processedLeads.forEach((lead) => {
        const quality = lead.качество?.toLowerCase()
        if (quality === "низкий") {
          qualityDistribution.низкий++
        } else if (quality === "средний") {
          qualityDistribution.средний++
        } else if (quality === "хороший") {
          qualityDistribution.хороший++
        } else if (quality === "высокий") {
          qualityDistribution.высокий++
        } else {
          qualityDistribution.other.push(lead.качество || "unknown")
        }
      })

      console.log("[v0] Quality distribution:", qualityDistribution)

      const dashboardData = {
        totalLeads: processedLeads.length,
        conversion:
          processedLeads.length > 0
            ? (
                ((processedLeads.filter((lead) => lead.качество === "высокий").length + 
                  processedLeads.filter((lead) => lead.качество === "хороший").length) / processedLeads.length) *
                100
              ).toFixed(1)
            : "0",
        highPotentialConversion:
          processedLeads.length > 0
            ? (
                (processedLeads.filter((lead) => lead.качество === "высокий").length / processedLeads.length) *
                100
              ).toFixed(1)
            : "0",
        leads: processedLeads,
        lastLead:
          processedLeads.length > 0
            ? formatDateFromTimestamp(
                processedLeads.reduce((latest, lead) => {
                  const leadDate = new Date(lead.дата).getTime()
                  const latestDate = new Date(latest.дата).getTime()
                  return leadDate > latestDate ? lead : latest
                }).дата,
              )
            : "Нет данных",
        bestDay:
          processedLeads.length > 0
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
        avgLeadsPerDay:
          processedLeads.length > 0
            ? Math.round(
                processedLeads.length /
                  Math.max(
                    processedLeads.reduce(
                      (acc, lead) => {
                        const date = formatTableDate(lead.дата)
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
        maxLeadsInOneDay:
          processedLeads.length > 0
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
            : 0,
      }

      const processedData: DashboardData = {
        leads: processedLeads,
        totalLeads: dashboardData.totalLeads,
        lowQuality: qualityDistribution.низкий,
        mediumQuality: qualityDistribution.средний,
        goodQuality: qualityDistribution.хороший,
        highQuality: qualityDistribution.высокий,
        highPotentialConversion: Number(dashboardData.highPotentialConversion),
        conversion: Number(dashboardData.conversion),
        lastLead: dashboardData.lastLead,
        bestDay: dashboardData.bestDay,
        avgLeadsPerDay: dashboardData.avgLeadsPerDay,
        maxLeadsInOneDay: dashboardData.maxLeadsInOneDay,
      }

      previousLeadsCount.current = processedData.totalLeads
      setData(processedData)
      setIsAutoRefreshEnabled(true)
      console.log("[v0] Dashboard data set successfully")
    } catch (err) {
      console.error("[v0] Error fetching data:", err)
      setError(
        `Ошибка загрузки данных: ${err instanceof Error ? err.message : "Неизвестная ошибка"}. Проверьте CORS настройки в Google Apps Script.`,
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads =
    data?.leads.filter((lead) => {
      const name = lead.имя || lead.client_name || ""
      const phone = lead.номер || lead.phone || ""
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(phone).toLowerCase().includes(searchTerm.toLowerCase())
      const matchesQuality = qualityFilter === "all" || lead.качество === qualityFilter

      let matchesDate = true
      if (dateRangeFilter.from || dateRangeFilter.to) {
        const leadDate = new Date(lead.дата || lead.timestamp || new Date())

        if (dateRangeFilter.from) {
          const fromDate = new Date(dateRangeFilter.from)
          matchesDate = matchesDate && leadDate >= fromDate
        }

        if (dateRangeFilter.to) {
          const toDate = new Date(dateRangeFilter.to)
          toDate.setHours(23, 59, 59, 999)
          matchesDate = matchesDate && leadDate <= toDate
        }
      }

      return matchesSearch && matchesQuality && matchesDate
    }) || []

  const getLatestLead = () => {
    if (!data?.leads || data.leads.length === 0) return null

    return data.leads.reduce((latest, lead) => {
      const leadDate = new Date(lead.дата || lead.timestamp || new Date()).getTime()
      const latestDate = new Date(latest.дата || latest.timestamp || new Date()).getTime()
      return leadDate > latestDate ? lead : latest
    })
  }

  const latestLead = getLatestLead()

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleQualityFilterChange = (value: string) => {
    setQualityFilter(value)
    setCurrentPage(1)
  }

  const handleDateRangeChange = (from: string, to: string) => {
    setDateRangeFilter({ from, to })
    setCurrentPage(1)
  }

  const getQualityScore = (lead: Lead) => {
    switch (lead.качество) {
      case "высокий":
        return 100
      case "средний":
        return 50
      case "низкий":
        return 25
      default:
        return 0
    }
  }

  const chartData = useMemo(() => {
    if (!data?.leads?.length)
      return {
        categoryData: [],
        leadStatsData: [],
      }

    // Category data
    const categoryData = data.leads
      .reduce(
        (acc, lead) => {
          const category = lead["выбранный автомобиль"] || lead.selected_car || "Без категории"
          const existing = acc.find((item) => item.category === category)
          if (existing) {
            existing.count += 1
          } else {
            acc.push({ category, count: 1 })
          }
          return acc
        },
        [] as { category: string; count: number }[],
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 categories

    // Lead statistics data with time filtering
    const now = new Date()
    const daysToFilter = leadStatsTimePeriod === "week" ? 7 : leadStatsTimePeriod === "month" ? 30 : 365
    const startDate = new Date(now.getTime() - (daysToFilter - 1) * 24 * 60 * 60 * 1000)
    startDate.setHours(0, 0, 0, 0) // Start of day

    const filteredLeads = data.leads.filter((lead) => {
      const leadDate = new Date(lead.дата)
      leadDate.setHours(0, 0, 0, 0) // Start of day for comparison
      return leadDate >= startDate
    })

    // First, create a map of all days in the range
    const allDays = []
    for (let i = 0; i < daysToFilter; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      allDays.push(formatDateOnly(date.toISOString()))
    }
    allDays.reverse() // Sort chronologically

    // Initialize all days with zero counts
    const leadStatsData = allDays.map(date => ({
      date,
      count: 0,
      high: 0,
      good: 0,
      medium: 0,
      low: 0,
    }))

    // Process filtered leads and update counts
    filteredLeads.forEach((lead) => {
      const date = formatDateOnly(lead.дата)
      const existing = leadStatsData.find((item) => item.date === date)
      if (existing) {
        existing.count += 1
        // Count quality distribution
        const quality = lead.качество || "неизвестно"
        if (quality === "высокий") existing.high += 1
        else if (quality === "хороший") existing.good += 1
        else if (quality === "средний") existing.medium += 1
        else existing.low += 1
      }
    })

    console.log("[v0] Lead stats data:", leadStatsData)
    console.log("[v0] Filtered leads count:", filteredLeads.length)
    console.log("[v0] All days:", allDays)
    console.log("[v0] Start date:", startDate)
    console.log("[v0] Sample lead dates:", filteredLeads.slice(0, 3).map(lead => ({ date: lead.дата, formatted: formatDateOnly(lead.дата) })))

    return { categoryData, leadStatsData }
  }, [data?.leads, leadStatsTimePeriod])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {newLeadsAlert && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{newLeadsAlert}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Панель управления лидами</h1>
              <p className="text-muted-foreground">Отслеживайте и анализируйте ваши лиды в реальном времени</p>
            </div>
            {isAutoRefreshEnabled && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Автообновление активно</span>
              </div>
            )}
          </div>

          {/* Connection Form */}
          <Card>
            <CardHeader>
              <CardTitle>Подключение к Google Apps Script</CardTitle>
              <CardDescription>Введите URL вашего Google Apps Script endpoint для загрузки данных</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input
                  placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={fetchData} disabled={loading}>
                  {loading ? "Загрузка..." : "Подключить"}
                </Button>
                <Button onClick={loadMockData} variant="outline">
                  Тестовые данные
                </Button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>
        </div>

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего лидов</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalLeads}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Низкий: {data.lowQuality} • Средний: {data.mediumQuality} • Хороший: {data.goodQuality} • Высокий: {data.highQuality}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.conversion}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Высокое + Хорошее качество / Всего лидов</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Высокий потенциал</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Последний лид</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {latestLead
                      ? latestLead.имя || latestLead.client_name || latestLead.номер || latestLead.phone || "Без имени"
                      : "Нет данных"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {latestLead ? formatDateFromTimestamp(latestLead.дата || latestLead.timestamp) : "Нет данных"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 opacity-70">Нажмите для подробностей</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Качественные лиды</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.highQuality}</div>
                  <div className="text-xs text-muted-foreground mt-1">Лиды высокого качества</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="leads" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="leads">Лиды</TabsTrigger>
                <TabsTrigger value="analytics">Аналитика</TabsTrigger>
              </TabsList>

              <TabsContent value="leads" className="space-y-6">
                {/* Leads Table */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Список лидов ({filteredLeads.length})</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={isAutoRefreshEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isAutoRefreshEnabled ? "animate-spin" : ""}`} />
                        {isAutoRefreshEnabled ? "Остановить" : "Автообновление"}
                      </Button>
                      {isAutoRefreshEnabled && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Активно</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 space-y-4">
                      <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Поиск по имени или телефону..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <Select value={qualityFilter} onValueChange={handleQualityFilterChange}>
                          <SelectTrigger className="w-48">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Качество" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все качества</SelectItem>
                            <SelectItem value="низкий">Низкий</SelectItem>
                            <SelectItem value="средний">Средний</SelectItem>
                            <SelectItem value="хороший">Хороший</SelectItem>
                            <SelectItem value="высокий">Высокий</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-4 items-center">
                        <span className="text-sm font-medium">Диапазон дат:</span>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="date"
                            value={dateRangeFilter.from}
                            onChange={(e) => handleDateRangeChange(e.target.value, dateRangeFilter.to)}
                            className="w-40"
                          />
                          <span className="text-muted-foreground">—</span>
                          <Input
                            type="date"
                            value={dateRangeFilter.to}
                            onChange={(e) => handleDateRangeChange(dateRangeFilter.from, e.target.value)}
                            className="w-40"
                          />
                          {(dateRangeFilter.from || dateRangeFilter.to) && (
                            <Button variant="ghost" size="sm" onClick={() => handleDateRangeChange("", "")}>
                              Сбросить
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Имя</TableHead>
                            <TableHead>Номер</TableHead>
                            <TableHead>Резюме</TableHead>
                            <TableHead>Выбранный автомобиль</TableHead>
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
                                {lead.имя || lead.client_name || "Не указано"}
                              </TableCell>
                              <TableCell>{lead.номер || lead.phone || "Не указан"}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {lead.резюме ||
                                  lead.resume ||
                                  lead.description ||
                                  lead.summary ||
                                  lead.комментарий ||
                                  lead.comment ||
                                  "Не указано"}
                              </TableCell>
                              <TableCell>{lead["выбранный автомобиль"] || lead.selected_car || "Не указан"}</TableCell>
                              <TableCell>
                                <Badge className={getQualityBadgeColor(lead.качество)} variant="secondary">
                                  {lead.качество}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatTableDate(lead.дата || lead.timestamp)}</TableCell>
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
                        Показано {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} из {filteredLeads.length}{" "}
                        лидов
                        {filteredLeads.length !== data.totalLeads && ` (отфильтровано из ${data.totalLeads})`}
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

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quality Distribution Pie Chart */}
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
                              { name: "Хорошее качество", value: data.goodQuality, color: "#10b981" },
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
                              { name: "Хорошее качество", value: data.goodQuality, color: "#10b981" },
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

                  {/* Leads by Car Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Лиды по категориям автомобилей</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.categoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
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
                        `Последние 7 дней (${formatDateOnly(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString())} - ${formatDateOnly(new Date().toISOString())})`}
                      {leadStatsTimePeriod === "month" &&
                        `Последние 30 дней (${formatDateOnly(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString())} - ${formatDateOnly(new Date().toISOString())})`}
                      {leadStatsTimePeriod === "year" &&
                        `Последние 365 дней (${formatDateOnly(new Date(Date.now() - 364 * 24 * 60 * 60 * 1000).toISOString())} - ${formatDateOnly(new Date().toISOString())})`}
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.leadStatsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="high" stackId="quality" fill="#22c55e" name="Высокое качество" />
                        <Bar dataKey="good" stackId="quality" fill="#10b981" name="Хорошее качество" />
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
                        <span>Хорошее качество</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${(data.goodQuality / data.totalLeads) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{data.goodQuality}</span>
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
            </Tabs>
          </>
        )}

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
                      {selectedLead.имя || selectedLead.client_name || "Не указано"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Номер телефона</Label>
                    <p className="text-lg">{selectedLead.номер || selectedLead.phone || "Не указан"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Выбранный автомобиль</Label>
                    <p className="text-lg">
                      {selectedLead["выбранный автомобиль"] || selectedLead.selected_car || "Не указан"}
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
                    <p
                      className="text-lg"
                      onClick={() => console.log("[v0] Date debug:", selectedLead.дата, selectedLead.timestamp)}
                    >
                      {formatTableDate(selectedLead.дата || selectedLead.timestamp)}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Резюме</Label>
                  <p className="text-lg">{selectedLead.резюме || "Не указано"}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
