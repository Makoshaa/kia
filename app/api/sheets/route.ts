import { NextRequest, NextResponse } from "next/server"

function isGvizUrl(url: string) {
  return /\/gviz\//.test(url)
}

function toCsvExportUrl(url: string) {
  // Handles typical share links and /edit links
  try {
    const u = new URL(url)
    // If already export?format=csv
    if (u.pathname.includes("/export")) return url
    // Transform /edit to /export?format=csv
    u.pathname = u.pathname.replace(/\/edit.*/, "/export")
    u.searchParams.set("format", "csv")
    return u.toString()
  } catch {
    return url
  }
}

function parseGvizJsonp(text: string): any[] {
  // gviz returns: google.visualization.Query.setResponse({...})
  const jsonMatch = text.match(/setResponse\((.*)\);?\s*$/s)
  if (!jsonMatch) return []
  const obj = JSON.parse(jsonMatch[1])
  const table = obj.table
  if (!table || !table.rows || !table.cols) return []
  const headers = table.cols.map((c: any) => (c && c.label ? c.label : "col"))
  const rows = table.rows.map((r: any) =>
    r.c.reduce((acc: Record<string, any>, cell: any, idx: number) => {
      acc[headers[idx] || `col${idx}`] = cell && cell.v !== null ? cell.v : ""
      return acc
    }, {}),
  )
  return rows
}

function parseCsv(csv: string): any[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const headers = lines[0].split(",").map((h) => h.trim())
  return lines.slice(1).map((line) => {
    // naive CSV split; works for simple sheets. For quoted commas, consider a CSV parser.
    const parts = line.split(",")
    const obj: Record<string, any> = {}
    headers.forEach((h, i) => {
      obj[h] = (parts[i] ?? "").trim()
    })
    return obj
  })
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    // Try gviz first if provided, else CSV export
    let rows: any[] = []
    if (isGvizUrl(url)) {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error(`Sheets gviz fetch failed: ${res.status}`)
      const text = await res.text()
      rows = parseGvizJsonp(text)
    } else {
      const exportUrl = toCsvExportUrl(url)
      const res = await fetch(exportUrl, { cache: "no-store" })
      if (!res.ok) throw new Error(`Sheets CSV fetch failed: ${res.status}`)
      const text = await res.text()
      rows = parseCsv(text)
    }

    return NextResponse.json({ data: rows })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch Google Sheets" },
      { status: 500 },
    )
  }
}


