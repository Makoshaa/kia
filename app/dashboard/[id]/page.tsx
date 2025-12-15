"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth, extractSheetInfo } from "@/lib/auth-context"
import { DashboardViewer } from "@/components/dashboard/dashboard-viewer"

export default function DashboardViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { dashboards, user } = useAuth()
  const dashboardId = params.id as string
  
  // Find the current dashboard
  const currentDashboard = dashboards.find(d => d.id === dashboardId)

  if (!currentDashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Дашборд не найден</h1>
          <Button onClick={() => router.back()}>Назад</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{currentDashboard.name}</h1>
              <p className="text-sm text-muted-foreground">Владелец: {currentDashboard.owner}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <DashboardViewer 
        endpoint={(() => {
          const { sheetId, gid } = extractSheetInfo(currentDashboard.googleSheetsUrl)
          const endpoint = `https://script.google.com/macros/s/AKfycbzHDO9JObYjTE7gZnxWylkKVrtOE6iItZKcY5JB2eYraVF_qIU4iwHsC1cFk-FBlFCjkg/exec?sheetId=${sheetId}&gid=${gid}`
          console.log('Admin Dashboard - Original URL:', currentDashboard.googleSheetsUrl)
          console.log('Admin Dashboard - Generated endpoint:', endpoint)
          return endpoint
        })()}
        title={currentDashboard.name}
        showConnectionForm={false}
        additionalColumns={currentDashboard.additionalColumns}
      />
    </div>
  )
}