"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, BarChart3, Download } from "lucide-react"

interface ReportPreviewProps {
  report: {
    name: string
    type: string
    dateRange: string
    metrics: string[]
    format: string
    schedule?: {
      enabled: boolean
      frequency: string
      time: string
    }
  }
}

export function ReportPreview({ report }: ReportPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
          <FileText className="h-5 w-5" />
          Report Preview
        </CardTitle>
        <CardDescription>Summary of your report configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Name</span>
          <span className="text-sm">{report.name || "Untitled Report"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Type</span>
          <Badge variant="outline">{report.type}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Date Range</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="text-sm">{report.dateRange.replace(/_/g, " ")}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Metrics</span>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span className="text-sm">{report.metrics.length} selected</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Format</span>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <Badge variant="outline" className="uppercase">
              {report.format}
            </Badge>
          </div>
        </div>

        {report.schedule?.enabled && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Schedule</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {report.schedule.frequency} at {report.schedule.time}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
